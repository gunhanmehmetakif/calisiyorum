// Zero-dependency static server + Gemini proxy for the Çalışıyorum product demo.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');

function loadEnv() {
  const candidates = [path.join(__dirname, '.env'), path.join(__dirname, '..', 'demo', '.env')];
  const file = candidates.find((f) => fs.existsSync(f));
  const env = {};
  if (!file) return env;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = loadEnv();
const API_KEY = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const MODEL = env.GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const FALLBACK = env.GEMINI_FALLBACK_MODEL || process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite';
// demo/.env may be shared for the key, but its PORT belongs to demo 1.
const PORT = Number(process.env.DEMO2_PORT || 5174);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

const PERSONA_RULES = 'Sen "Ece" adında, Çalışıyorum platformunun AI kariyer koçusun. Türkçe, sıcak ama profesyonel, kısa (2-3 cümle) yaz. Emoji kullanma. Yalnızca geçerli JSON döndür.';

function buildSystem(body) {
  const vocab = (body.skillVocab || []).join(', ');
  if (body.mode === 'interview') {
    return `${PERSONA_RULES}
Görev: adayla tanışma görüşmesi. Aday formu: ${JSON.stringify(body.form || {})}.
CV metni (özet): ${String(body.cvText || '').slice(0, 5000)}
Kurallar: ilk mesajda CV'den somut bir şeye değin, selam ver ve tek bir soru sor. Her mesajda tek soru; toplam en fazla 3 soru. 3. cevaptan sonra done:true döndür ve profile ver.
Çıktı JSON: {"reply":string,"quickReplies":string[2-3],"done":boolean,"profile":{"targetRoles":string[],"skills":string[],"missingSkills":string[],"level":string,"cities":string[],"remoteOk":boolean,"jobTypes":string[],"interests":string[],"summary":string}}. profile yalnız done:true iken. skills ve missingSkills yalnız şu sözlükten seçilir: ${vocab}.`;
  }
  return `${PERSONA_RULES}
Görev: panelde duran kişisel asistan. Açık ekran bağlamı: ${JSON.stringify(body.context || {}).slice(0, 6000)}
Profil: ${JSON.stringify(body.profile || {}).slice(0, 2000)}
Ön yazı istenirse reply içinde kısa bir taslak ver. Liste filtresi istenirse filters ver.
Çıktı JSON: {"reply":string,"quickReplies":string[2-4],"filters":{"jobTypes":string[],"remoteOk":boolean,"cities":string[],"interests":string[]},"action":"none"|"openJob"|"openCourse","targetId":string}. filters, action ve targetId isteğe bağlıdır.`;
}

async function callGemini(model, payload) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': API_KEY },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

async function handleCoach(body) {
  const history = Array.isArray(body.history) ? body.history : [];
  const contents = history
    .filter((m) => m && m.text)
    .map((m) => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: String(m.text) }] }));
  if (!contents.length || contents[0].role !== 'user') {
    contents.unshift({ role: 'user', parts: [{ text: 'Merhaba' }] });
  }
  const payloadFor = (model) => {
    const generationConfig = { responseMimeType: 'application/json', temperature: 0.6 };
    if (model.startsWith('gemini-2.5')) generationConfig.thinkingConfig = { thinkingBudget: 0 };
    return { systemInstruction: { parts: [{ text: buildSystem(body) }] }, contents, generationConfig };
  };
  let r = await callGemini(MODEL, payloadFor(MODEL));
  if ((r.status === 400 || r.status === 404) && FALLBACK && FALLBACK !== MODEL) {
    r = await callGemini(FALLBACK, payloadFor(FALLBACK));
  }
  if (r.status !== 200) return { status: 502, json: { error: 'upstream', code: r.status } };
  const text = r.data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  try {
    return { status: 200, json: JSON.parse(text.replace(/^```json\s*|```\s*$/g, '').trim()) };
  } catch {
    return { status: 502, json: { error: 'bad-json' } };
  }
}

function readBody(req, limit = 1_500_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(obj));
}

function modelLabel(m) {
  return m.replace(/^gemini-/, 'Gemini ').replace(/-flash-lite/, ' Flash-Lite').replace(/-flash/, ' Flash').replace(/-pro/, ' Pro');
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/api/status') {
      return sendJson(res, 200, { ai: Boolean(API_KEY), model: API_KEY ? modelLabel(MODEL) : null });
    }
    if (req.method === 'POST' && url.pathname === '/api/coach') {
      if (!API_KEY) return sendJson(res, 503, { error: 'no-key' });
      let body;
      try { body = JSON.parse(await readBody(req)); } catch { return sendJson(res, 400, { error: 'bad-request' }); }
      try {
        const out = await handleCoach(body);
        return sendJson(res, out.status, out.json);
      } catch {
        return sendJson(res, 502, { error: 'upstream' });
      }
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'method' });
    let rel = decodeURIComponent(url.pathname);
    if (rel === '/') rel = '/index.html';
    const file = path.normalize(path.join(PUBLIC, rel));
    if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end('Forbidden'); }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Bulunamadı'); }
      res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : buf);
    });
  } catch {
    res.writeHead(500); res.end('Hata');
  }
});

server.listen(PORT, () => {
  console.log(`Çalışıyorum demo2: http://localhost:${PORT}  (AI: ${API_KEY ? modelLabel(MODEL) : 'Demo modu'})`);
});
