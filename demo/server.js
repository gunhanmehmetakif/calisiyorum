import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(root, 'public');
let env = {};
try {
  env = Object.fromEntries((await readFile(path.join(root, '.env'), 'utf8')).split(/\r?\n/).filter(line => line && !line.trim().startsWith('#')).map(line => {
    const index = line.indexOf('=');
    return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^(["'])(.*)\1$/, '$2')];
  }).filter(([key]) => key));
} catch {}

const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const primaryModel = env.GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const fallbackModel = env.GEMINI_FALLBACK_MODEL || process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite';
const port = Number(env.PORT || process.env.PORT || 5173);
let activeModel = primaryModel;
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

function send(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(data));
}

async function body(req) {
  let input = '';
  for await (const chunk of req) {
    input += chunk;
    if (input.length > 250000) throw new Error('İstek çok büyük.');
  }
  return JSON.parse(input);
}

function instruction({ mode, form, cvText, skillVocab, history }) {
  const context = `Aday formu: ${JSON.stringify(form)}\nCV: ${String(cvText).slice(0, 16000)}\nBeceri sözlüğü: ${JSON.stringify(skillVocab)}\nÖnceki mesaj sayısı: ${(history || []).filter(item => item.role === 'user').length}`;
  if (mode === 'refine') return `Sen Ece, Türkçe konuşan sıcak ve profesyonel kariyer koçusun. Kullanıcının ilan filtrelerini güncelle. Yalnız JSON döndür: {"reply":string,"filters":{"jobTypes"?:string[],"remoteOk"?:boolean,"cities"?:string[],"addSkills"?:string[]}}. Kısa yanıt ver. Beceri yalnız sözlükten gelsin.\n${context}`;
  return `Sen Ece, Türkçe konuşan sıcak ve profesyonel kariyer koçusun. CV'ye ve forma göre konuş. Tek seferde yalnız bir kısa soru sor; toplam en fazla 3 soru. Mesaj en fazla 2-3 cümle olsun. Üçüncü kullanıcı yanıtından sonra done=true ve profile zorunlu. Yalnız JSON döndür: {"reply":string,"quickReplies":string[],"done":boolean,"profile"?:{"targetRoles":string[],"skills":string[],"missingSkills":string[],"level":"öğrenci"|"yeni mezun"|"junior"|"deneyimli","cities":string[],"remoteOk":boolean,"jobTypes":string[],"summary":string}}. skills ve missingSkills yalnız sözlükteki tam değerler olabilir.\n${context}`;
}

async function generate(model, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const request = {
      systemInstruction: { parts: [{ text: instruction(payload) }] },
      contents: (payload.history || []).filter(item => ['user', 'model'].includes(item.role)).map(item => ({ role: item.role, parts: [{ text: String(item.text).slice(0, 5000) }] })),
      generationConfig: { responseMimeType: 'application/json', temperature: 0.6 }
    };
    if (!request.contents.length) request.contents.push({ role: 'user', parts: [{ text: 'CV ve forma göre ilk mesajını ver.' }] });
    if (model.startsWith('gemini-2.5')) request.generationConfig.thinkingConfig = { thinkingBudget: 0 };
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey }, body: JSON.stringify(request), signal: controller.signal
    });
    const result = await response.json();
    if (!response.ok) {
      const error = new Error(result.error?.message || 'AI servisine ulaşılamadı.');
      error.status = response.status;
      throw error;
    }
    return JSON.parse(result.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') || '{}');
  } finally { clearTimeout(timer); }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/status' && req.method === 'GET') return send(res, 200, { ai: Boolean(apiKey), model: activeModel });
  if (url.pathname === '/api/coach' && req.method === 'POST') {
    if (!apiKey) return send(res, 502, { error: 'Demo modu etkin.' });
    try {
      const payload = await body(req);
      if (!['interview', 'refine'].includes(payload.mode)) return send(res, 400, { error: 'Geçersiz mod.' });
      try { return send(res, 200, await generate(activeModel, payload)); }
      catch (error) {
        if (activeModel === primaryModel && fallbackModel !== primaryModel && [400, 404].includes(error.status) && /model|not found|not supported/i.test(error.message)) {
          const result = await generate(fallbackModel, payload);
          activeModel = fallbackModel;
          return send(res, 200, result);
        }
        throw error;
      }
    } catch (error) { return send(res, 502, { error: error.name === 'AbortError' ? 'AI yanıtı zaman aşımına uğradı.' : 'AI servisine ulaşılamadı.' }); }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Yöntem desteklenmiyor.' });
  try {
    const relative = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const file = path.resolve(publicRoot, '.' + relative);
    if (!file.startsWith(publicRoot + path.sep)) return send(res, 403, { error: 'Erişim reddedildi.' });
    const info = await stat(file);
    if (!info.isFile()) throw new Error('Not a file');
    res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? undefined : await readFile(file));
  } catch { send(res, 404, { error: 'Sayfa bulunamadı.' }); }
});
server.listen(port, () => console.log(`AI: ${apiKey ? 'açık' : 'kapalı'}, model: ${activeModel}, http://localhost:${port}`));
