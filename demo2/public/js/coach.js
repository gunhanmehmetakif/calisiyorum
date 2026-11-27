// Coach client: Gemini proxy calls with a full local fallback so the demo never stalls.
import { SKILL_VOCAB, JOBS } from '../data/jobs.js';
import { COURSES } from '../data/courses.js';
import { SAMPLE_CVS } from '../data/sample-cvs.js';
import { norm, scoreJob, rankJobs, FIELDS, CITIES, coursesFor } from './match.js';
import { firstName, sleep } from './ui.js';

let status = { ai: false, model: null };
const listeners = new Set();
export const onStatus = (fn) => listeners.add(fn);
export const getStatus = () => status;
export const badgeText = () => (status.ai ? status.model : 'Demo modu');
const setStatus = (s) => { status = s; listeners.forEach((fn) => fn(s)); };

export async function loadStatus() {
  try { setStatus(await (await fetch('/api/status')).json()); } catch { setStatus({ ai: false, model: null }); }
}

async function post(body) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch('/api/coach', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal });
    if (!res.ok) throw new Error('coach ' + res.status);
    return await res.json();
  } finally { clearTimeout(t); }
}

// ---------- CV skill extraction ----------
const ALIASES = {
  JavaScript: ['javascript', 'js'], 'Node.js': ['node'], 'Bulut Bilişim': ['bulut', 'aws', 'azure'],
  'Makine Öğrenmesi': ['makine öğren', 'machine learning'], 'Veri Analizi': ['veri analiz', 'veri görselleştir'],
  'Sosyal Medya': ['sosyal medya', 'instagram'], İngilizce: ['ingilizce', 'english'], 'İşe Alım': ['işe alım', 'recruit'],
  'Mülakat Yönetimi': ['mülakat'], 'Test Otomasyonu': ['test otomasyon', 'selenium', 'cypress'],   'Pazar Araştırması': ['pazar araştırma'], 'Google Analytics': ['analytics'], 'Kullanıcı Araştırması': ['kullanıcı araştırma'],
  'Takım Çalışması': ['takım çalış', 'ekip çalış'], Sunum: ['sunum'], İletişim: ['iletişim'],
};
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\#]/g, '\\$&');
export function extractSkills(text) {
  const t = norm(text);
  return SKILL_VOCAB.filter((s) => {
    const alts = [reEsc(norm(s)), ...(ALIASES[s] || []).map(reEsc)];
    const right = norm(s).length <= 5 || (ALIASES[s] || []).includes('js') ? '(?![a-zçğıöşü0-9])' : '';
    return new RegExp(`(?<![a-zçğıöşü0-9])(?:${alts.join('|')})${right}`).test(t);
  });
}

// ---------- local helpers ----------
const PHRASE = { Yazılım: 'Yazılım geliştirme', Veri: 'Veri analizi', Pazarlama: 'Dijital pazarlama', İK: 'İnsan kaynakları', Finans: 'Finans', Tasarım: 'Tasarım', Satış: 'Satış', Üretim: 'Üretim', Lojistik: 'Lojistik' };
const SOFT = new Set(['İletişim', 'Takım Çalışması', 'İngilizce', 'Sunum']);

function topFields(skills) {
  const score = Object.fromEntries(FIELDS.map((f) => [f, 0]));
  JOBS.forEach((j) => { score[j.field] += j.requiredSkills.filter((s) => skills.includes(s) && !SOFT.has(s)).length; });
  const ranked = FIELDS.filter((f) => score[f] > 0).sort((a, b) => score[b] - score[a]);
  return ranked.length ? ranked : ['Yazılım', 'Pazarlama'];
}

function fieldFromText(text) {
  const n = norm(text);
  return FIELDS.filter((f) => n.includes(norm(f)) || n.includes(norm(PHRASE[f]).split(' ')[0]) || (f === 'İK' && /insan kaynak/.test(n)));
}

function buildProfile({ form, skills, answers, sampleId }) {
  const status2 = form.status || 'Öğrenci';
  const level = status2 === 'Deneyimli' ? 'Orta' : status2 === 'Yeni mezun' ? 'Junior' : 'Stajyer';
  let interests = fieldFromText(answers[0] || '');
  if (!interests.length) interests = topFields(skills).slice(0, 2);
  const a1 = norm(answers[1] || '');
  const anyCity = /fark etmez|farketmez/.test(a1);
  const cities = anyCity ? [] : CITIES.filter((c) => c !== 'Uzaktan' && a1.includes(norm(c)));
  const remoteOk = anyCity || /uzaktan|olur|evet/.test(a1) || !cities.length;
  const a2 = norm(answers[2] || '');
  const jobTypes = /staj/.test(a2) && !/ikisi/.test(a2) ? ['Staj'] : /tam zaman|^iş|sadece iş/.test(a2) && !/ikisi/.test(a2) ? ['İş'] : ['İş', 'Staj'];
  const draft = { skills, interests, cities, remoteOk, jobTypes, level, targetRoles: [] };
  const ranked = rankJobs(draft);
  const freq = {};
  ranked.slice(0, 8).forEach((r) => r.m.missing.forEach((s) => { freq[s] = (freq[s] || 0) + 1; }));
  let missingSkills = Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 2);
  const sample = SAMPLE_CVS[sampleId];
  if (sample) missingSkills = sample.profile.missingSkills;
  const targetRoles = [...new Set(ranked.slice(0, 6).map((r) => r.job.title.replace(/\s*\(.*?\)/g, '').replace(/ Stajyeri$/, ' Stajyeri')))].slice(0, 3);
  const key = skills.filter((s) => !SOFT.has(s)).slice(0, 2).join(' ve ');
  const summary = `${key ? key + ' becerilerinle' : 'Mevcut becerilerinle'} ${interests[0]} alanında güçlü bir başlangıç yapıyorsun.${missingSkills.length ? ` ${missingSkills.join(' ve ')} becerisini eklersen uyumun belirgin yükselir.` : ''}`;
  return { targetRoles, skills, missingSkills, level, cities, remoteOk, jobTypes, interests, summary };
}

function localInterview({ form, skills, answers, sampleId }) {
  const step = answers.length;
  const first = firstName(form.name);
  if (step === 0) {
    const hard = skills.filter((s) => !SOFT.has(s));
    const mention = hard.length >= 2 ? `${hard[0]} ve ${hard[1]} deneyimin dikkatimi çekti` : 'CV\'ni dikkatle okudum';
    const fields = topFields(skills).slice(0, 2).map((f) => PHRASE[f]);
    return { reply: `Merhaba ${first}, ben Ece! ${mention}. Seni daha iyi tanımak için üç kısa sorum var. İlki: hangi tür işte kendini en çok görüyorsun?`, quickReplies: [...fields, 'Henüz emin değilim'], done: false };
  }
  if (step === 1) {
    const ack = /emin değilim/.test(norm(answers[0])) ? 'Sorun değil, CV\'ne bakarak yönlendiririm.' : `${answers[0]} tarafı CV'inle de tutarlı görünüyor.`;
    return { reply: `${ack} İkinci soru: hangi şehirde çalışmak istersin, uzaktan çalışma sana uyar mı?`, quickReplies: ['İstanbul', 'Uzaktan olur', 'Fark etmez'], done: false };
  }
  if (step === 2) {
    return { reply: 'Not aldım. Son soru: şu an staj mı yoksa tam zamanlı iş mi arıyorsun?', quickReplies: ['Staj', 'Tam zamanlı iş', 'İkisi de'], done: false };
  }
  return { reply: `Teşekkürler ${first}, ihtiyacım olan her şey bende. Profilini hazırlıyorum.`, quickReplies: [], done: true, profile: buildProfile({ form, skills, answers, sampleId }) };
}

function normalizeProfile(p, fallback) {
  const arr = (v, d = []) => (Array.isArray(v) ? v.map(String) : d);
  const skills = arr(p?.skills).filter((s) => SKILL_VOCAB.includes(s));
  return {
    targetRoles: arr(p?.targetRoles, fallback.targetRoles).slice(0, 4),
    skills: skills.length ? skills : fallback.skills,
    missingSkills: arr(p?.missingSkills).filter((s) => SKILL_VOCAB.includes(s)),
    level: ['Stajyer', 'Junior', 'Orta'].includes(p?.level) ? p.level : fallback.level,
    cities: arr(p?.cities).filter((c) => CITIES.includes(c) && c !== 'Uzaktan'),
    remoteOk: p?.remoteOk !== false,
    jobTypes: arr(p?.jobTypes).filter((t) => t === 'İş' || t === 'Staj').length ? arr(p.jobTypes).filter((t) => t === 'İş' || t === 'Staj') : fallback.jobTypes,
    interests: arr(p?.interests).filter((f) => FIELDS.includes(f)).length ? arr(p.interests).filter((f) => FIELDS.includes(f)) : fallback.interests,
    summary: typeof p?.summary === 'string' && p.summary ? p.summary : fallback.summary,
  };
}

// sess: { form, cvText, skills, answers[], history[], sampleId }
// Onboarding interview is scripted on purpose; Gemini is used in the panel assistant.
const AI_INTERVIEW = false;

export async function interviewTurn(sess) {
  if (AI_INTERVIEW && status.ai) {
    try {
      const r = await post({ mode: 'interview', form: sess.form, cvText: sess.cvText, skillVocab: SKILL_VOCAB, history: sess.history });
      if (typeof r.reply !== 'string' || !r.reply) throw new Error('empty');
      const done = Boolean(r.done) || sess.answers.length >= 3;
      const out = { reply: r.reply, quickReplies: Array.isArray(r.quickReplies) ? r.quickReplies.slice(0, 3) : [], done };
      if (done) {
        const fb = buildProfile(sess);
        out.profile = normalizeProfile(r.profile, fb);
        if (!out.profile.missingSkills.length) out.profile.missingSkills = fb.missingSkills;
      }
      return out;
    } catch { setStatus({ ...status, ai: false }); }
  }
  await sleep(750);
  return localInterview(sess);
}

// ---------- assistant ----------
const weeks = (c) => Math.max(1, Math.ceil(c.hours / 6));
const pct = (n) => `%${n}`;

export function contextComment(ctx, profile) {
  const first = firstName(ctx.userName);
  switch (ctx.screen) {
    case 'home': {
      const t = ctx.top;
      return t ? `Merhaba ${first}. Profiline en uygun ilan şu an ${t.job.company} / ${t.job.title} (${pct(t.m.total)}). İstersen ona birlikte bakalım.` : `Merhaba ${first}, buradayım.`;
    }
    case 'job': {
      const { job, m } = ctx;
      if (!m.missing.length) return `Bu ilana ${pct(m.total)} uyumlusun; zorunlu becerilerin tamamı sende. Başvurmaya değer.`;
      const c = coursesFor(m.missing[0])[0];
      const tail = c ? ` ${c.title} eğitimi haftada 6 saatle yaklaşık ${weeks(c)} haftada kapatır.` : '';
      return `Bu ilana ${pct(m.total)} uyumlusun; eksik: ${m.missing.join(', ')}.${tail}`;
    }
    case 'jobs': return `${ctx.count} ilanı uyumuna göre sıraladım. Filtreyi bana söyleyebilirsin, örneğin "uzaktan işler".`;
    case 'interns': return `${ctx.count} staj var; en uyumlusu ${ctx.top ? `${ctx.top.job.company} (${pct(ctx.top.m.total)})` : 'listenin başında'}.`;
    case 'courses': return ctx.top ? `Önerileri eksik becerilerine göre seçtim. En çok fark yaratan: ${ctx.top.course.title} (uyum ${pct(ctx.top.gain.before)} → ${pct(ctx.top.gain.after)}).` : 'Katalogdaki eğitimlere göz atabilirsin.';
    case 'apps': return ctx.count ? `${ctx.count} başvurun var. Mülakat aşamasındakiler için hazırlık yapmak ister misin?` : 'Henüz başvurun yok; bir ilan açıp "Başvur" demen yeterli.';
    case 'profile': return 'Profilini buradan düzenleyebilirsin. Değişiklikler ilan sıralamasına anında yansır.';
    default: return '';
  }
}

export function quickFor(ctx) {
  if (ctx?.screen === 'job') return ['Bu ilana başvurmalı mıyım?', 'Ön yazı taslağı hazırla', 'Eksiklerimi nasıl kapatırım?'];
  if (ctx?.screen === 'courses') return ['Hangi eğitimle başlamalıyım?', 'Sadece stajları göster', 'Bana en uygun ilan hangisi?'];
  if (ctx?.screen === 'apps') return ['Mülakata nasıl hazırlanırım?', 'Bana en uygun ilan hangisi?', 'Uzaktan işler'];
  return ['Sadece stajları göster', 'Uzaktan işler', 'Bana en uygun ilan hangisi?'];
}

export function coverLetter(job, profile, name) {
  const have = (profile.skills || []).filter((s) => job.requiredSkills.includes(s) || job.niceSkills.includes(s)).slice(0, 3).join(', ');
  return `Merhaba ${job.company} ekibi,\n${job.title} ilanınızı büyük bir ilgiyle inceledim. ${have ? `${have} alanlarındaki deneyimimle` : 'Becerilerimle'} bu role katkı verebileceğime inanıyorum ve hızlı öğrenen biriyim. Görüşme fırsatı için teşekkür ederim.\n${name}`;
}

function localAssistant(text, ctx, profile, name) {
  const n = norm(text);
  const job = ctx?.job;
  const q = quickFor(ctx);
  const top = ctx?.topJobs?.[0];
  if (/ön yaz|motivasyon|cover/.test(n) && job) {
    return { reply: `İşte kısa bir taslak:\n\n${coverLetter(job, profile, name)}`, quickReplies: ['Bu ilana başvurmalı mıyım?', 'Eksiklerimi nasıl kapatırım?'] };
  }
  if (/başvur/.test(n) && job) {
    const t = ctx.m.total;
    const reply = t >= 80 ? `Evet, ${pct(t)} uyumla güçlü bir adaysın. Ön yazını ekleyip başvurmanı öneririm.` : t >= 60 ? `Başvurabilirsin; ${pct(t)} uyumun fena değil. ${ctx.m.missing.join(', ')} eksiğini ön yazıda "öğreniyorum" diye belirtirsen şansın artar.` : `${pct(t)} uyum biraz düşük. Önce ${ctx.m.missing.join(', ')} tarafını tamamlayıp sonra başvurmak daha verimli olur.`;
    return { reply, quickReplies: ['Ön yazı taslağı hazırla', 'Eksiklerimi nasıl kapatırım?'] };
  }
  if (/mülakat/.test(n)) {
    return { reply: 'Mülakat için üç şey: projelerini 1 dakikada anlatmayı hazırla, ilandaki iki becerinle örnek ver, şirkete dair bir soru sor. İstersen sana prova soruları da sorabilirim.', quickReplies: ['Bana en uygun ilan hangisi?', 'Uzaktan işler'] };
  }
  if (/eksik|eğitim|kapat|nasıl başla|hangi eğitim/.test(n)) {
    const miss = ctx?.m?.missing?.length ? ctx.m.missing : profile.missingSkills || [];
    const c = miss.map((s) => coursesFor(s)[0]).find(Boolean) || COURSES[0];
    return { reply: miss.length ? `${miss[0]} becerisi için ${c.title} iyi bir başlangıç: ${c.hours} saat, ${c.priceTL} TL${c.sponsored ? ' ve sponsorlu burs seçeneği var' : ''}.` : 'Önemli bir eksiğin görünmüyor. İstersen yeni bir beceriyle öne çıkabilirsin.', quickReplies: q, action: 'openCourse', targetId: c.id };
  }
  const filters = {};
  if (/staj/.test(n) && !/tam zaman/.test(n)) filters.jobTypes = ['Staj'];
  if (/tam zaman|sadece iş|işleri göster/.test(n)) filters.jobTypes = ['İş'];
  if (/uzaktan/.test(n)) { filters.remoteOk = true; if (/iş/.test(n) && !filters.jobTypes && /uzaktan iş/.test(n)) filters.jobTypes = ['İş']; }
  const cities = CITIES.filter((c) => c !== 'Uzaktan' && n.includes(norm(c)));
  if (cities.length) filters.cities = cities;
  const fields = FIELDS.filter((f) => f !== 'İK' && n.includes(norm(f)));
  if (fields.length) filters.interests = fields;
  if (/temizle|sıfırla|hepsini|tüm ilan/.test(n)) Object.assign(filters, { jobTypes: [], cities: [], interests: [], remoteOk: false });
  if (Object.keys(filters).length) {
    return { reply: filters.jobTypes?.[0] === 'Staj' ? 'Stajları uyuma göre sıraladım.' : filters.remoteOk ? 'Uzaktan çalışılabilen ilanları gösteriyorum.' : 'Listeyi isteğine göre güncelledim.', quickReplies: q, filters, action: 'none' };
  }
  if (/en uygun|öner|hangi ilan|ne yap/.test(n) && top) {
    return { reply: `Şu an en uyumlu ilanın ${top.job.company} / ${top.job.title}, ${pct(top.m.total)} uyum. Açıyorum.`, quickReplies: q, action: 'openJob', targetId: top.job.id };
  }
  if (/merhaba|selam|nasılsın/.test(n)) return { reply: `Merhaba ${firstName(name)}! İlanlar, eğitimler ya da başvuruların hakkında soru sorabilirsin.`, quickReplies: q };
  return { reply: 'Bunu tam anlayamadım, ama şunlarda yardımcı olabilirim: ilanları filtrelemek, bir ilana uyumunu yorumlamak, ön yazı hazırlamak ya da eğitim önermek.', quickReplies: q };
}

export async function assistantTurn({ text, ctx, profile, name, history }) {
  const apiCtx = {
    screen: ctx?.screen, job: ctx?.job && { id: ctx.job.id, title: ctx.job.title, company: ctx.job.company, city: ctx.job.city, type: ctx.job.type, required: ctx.job.requiredSkills, nice: ctx.job.niceSkills },
    match: ctx?.m && { score: ctx.m.total, missing: ctx.m.missing }, topJobs: (ctx?.topJobs || []).slice(0, 5).map((r) => ({ id: r.job.id, title: r.job.title, score: r.m.total })),
  };
  if (status.ai) {
    try {
      const r = await post({ mode: 'assistant', form: { name }, cvText: '', profile, context: apiCtx, skillVocab: SKILL_VOCAB, history });
      if (typeof r.reply !== 'string' || !r.reply) throw new Error('empty');
      return { reply: r.reply, quickReplies: Array.isArray(r.quickReplies) ? r.quickReplies.slice(0, 4) : quickFor(ctx), filters: normalizeAiFilters(r.filters, localAssistant(text, ctx, profile, name).filters), action: r.action, targetId: r.targetId };
    } catch { setStatus({ ...status, ai: false }); }
  }
  await sleep(550);
  return localAssistant(text, ctx, profile, name);
}

// Gemini may answer with English or loose labels; map them to the values used in jobs.js ('İş' | 'Staj').
const JOB_TYPE_MAP = { internship: 'Staj', intern: 'Staj', staj: 'Staj', stajyer: 'Staj', job: 'İş', 'iş': 'İş', 'full-time': 'İş', fulltime: 'İş', 'full time': 'İş', 'tam zamanlı': 'İş', 'part-time': 'İş', 'yarı zamanlı': 'İş' };
function normalizeAiFilters(filters, localFilters) {
  if (!filters || typeof filters !== 'object') return localFilters;
  const out = { ...filters };
  if (Array.isArray(out.jobTypes) && out.jobTypes.length) {
    const mapped = [...new Set(out.jobTypes.map((t) => JOB_TYPE_MAP[String(t).toLocaleLowerCase('tr').trim()]).filter(Boolean))];
    if (mapped.length) out.jobTypes = mapped;
    else if (localFilters?.jobTypes) out.jobTypes = localFilters.jobTypes;
    else delete out.jobTypes;
  }
  if (!Object.keys(out).length && localFilters) return localFilters;
  return out;
}

export { scoreJob };
