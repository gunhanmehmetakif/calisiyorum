// Panel pages (center column). Each view: (root, api) => void; api = { rerender }.
import * as store from './store.js';
import { JOBS, SKILL_VOCAB } from '../data/jobs.js';
import { COURSES } from '../data/courses.js';
import { rankJobs, scoreJob, recommendCourses, courseGain, coursesFor, profileStrength, FIELDS, CITIES } from './match.js';
import { setContext, coachSay } from './assistant.js';
import { esc, icon, monogram, ring, animateRings, animateBars, countUp, modal, observeReveal, firstName, $, $$ } from './ui.js';

const STEPS = ['Gönderildi', 'İnceleniyor', 'Mülakat'];
const days = (n) => (n === 0 ? 'Bugün' : `${n} gün önce`);
const tl = (n) => Number(n).toLocaleString('tr-TR');
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : 'İyi akşamlar'; };
const state = () => store.get();

// ---------- shared fragments ----------
function jobCard({ job, m }, i = 0) {
  const salary = job.salaryRange ? `<span class="badge soft">${esc(job.salaryRange)}</span>` : '';
  return `<a class="card job-card lift" href="#/ilan/${job.id}" style="--i:${i}">
    <div class="jc-top">${monogram(job.company, job.companyColor)}
      <div class="jc-t"><b>${esc(job.title)}</b><span>${esc(job.company)} · ${esc(job.city)}</span></div>${ring(m.total, 52)}</div>
    <div class="badges"><span class="badge ${job.type === 'Staj' ? 'intern' : 'job'}">${job.type}</span><span class="badge soft">${job.workMode}</span>${salary}</div>
    <ul class="why">${m.reasons.map((r) => `<li>${icon('check', 15)}<span>${esc(r)}</span></li>`).join('')}</ul>
    ${m.missing.length ? `<div class="chips">${m.missing.map((s) => `<span class="chip amber">Eksik: ${esc(s)}</span>`).join('')}</div>` : ''}
  </a>`;
}

function courseCard({ course, gain }, enrolled, i = 0) {
  const done = enrolled.includes(course.id);
  return `<div class="card course-card lift" style="--i:${i}">
    <div class="cc-top"><b>${esc(course.title)}</b>${course.sponsored ? '<span class="badge sponsor">Sponsorlu burs</span>' : ''}</div>
    <span class="muted">${esc(course.provider)} · ${icon('clock', 13)} ${course.hours} saat · ★ ${course.rating}</span>
    <div class="chips">${course.skills.map((s) => `<span class="chip amber">${esc(s)}</span>`).join('')}</div>
    ${gain ? `<div class="gain">Uyumun <b>%${gain.before}</b> <span>→</span> <b class="up">%${gain.after}</b><small>${esc(gain.job.title)}</small></div>` : ''}
    <div class="cc-foot"><strong>${tl(course.priceTL)} TL</strong>
      ${done ? `<span class="badge job">Kayıtlısın ${icon('check', 13)}</span>` : `<button class="btn small" data-enroll="${course.id}">Kaydol</button>`}</div>
  </div>`;
}

function appRow(a, full = false) {
  const job = JOBS.find((j) => j.id === a.jobId);
  if (!job) return '';
  const idx = STEPS.indexOf(a.status);
  const ago = Math.max(0, Math.round((Date.now() - a.at) / 86400000));
  const head = `<a class="app-head" href="#/ilan/${job.id}">${monogram(job.company, job.companyColor, 38)}<div><b>${esc(job.title)}</b><span>${esc(job.company)} · ${days(ago)}</span></div><span class="pill s${idx}">${esc(a.status)}</span></a>`;
  if (!full) return `<div class="app-row">${head}</div>`;
  return `<div class="card app-card">${head}<ol class="tl">${STEPS.map((s, k) => `<li class="${k < idx ? 'done' : k === idx ? 'current' : ''}"><i>${k <= idx ? icon('check', 12) : ''}</i><span>${s}</span></li>`).join('')}</ol></div>`;
}

const sectionHead = (title, sub = '', right = '') => `<div class="sec-head"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${right}</div>`;

function after(root) { animateRings(root); animateBars(root); observeReveal(root); }

function applyModal(job, m, done) {
  modal(`<div class="modal-ok"><span class="okmark">${icon('check', 30)}</span><h3>Başvurun uyum raporunla iletildi</h3>
    <p>${esc(job.company)} · ${esc(job.title)}</p>
    <div class="report"><div><b>%${m.total}</b><span>Uyum</span></div><div><b>${m.matched.length}/${job.requiredSkills.length}</b><span>Zorunlu beceri</span></div><div><b>${m.missing.length}</b><span>Eksik</span></div></div>
    <button class="btn" data-close>Tamam</button></div>`, () => done?.());
}

function enrollModal(course, done) {
  modal(`<h3>Eğitime kaydol</h3>
    <div class="sum"><div><b>${esc(course.title)}</b><span>${esc(course.provider)} · ${course.hours} saat</span></div>
      <div class="sum-row"><span>Ücret</span><b>${tl(course.priceTL)} TL</b></div>
      ${course.sponsored ? `<div class="sum-row"><span>Sponsorlu burs</span><b class="up">Başvuru ile %100'e kadar</b></div>` : ''}</div>
    <p class="demo-note">Demo: ödeme alınmaz. Bu ekran yalnızca akışı gösterir.</p>
    <div class="modal-actions"><button class="btn ghost" data-close>Vazgeç</button><button class="btn" data-confirm>Kaydı tamamla</button></div>`,
  (wrap, close) => wrap.querySelector('[data-confirm]').addEventListener('click', () => { close(); done(); }));
}

function bindCommon(root, api) {
  root.addEventListener('click', (e) => {
    const en = e.target.closest('[data-enroll]');
    if (en) {
      const c = COURSES.find((x) => x.id === en.dataset.enroll);
      enrollModal(c, () => {
        const s = state();
        store.set({ enrolled: [...s.enrolled, c.id] });
        const g = courseGain(c, s.profile);
        coachSay(g ? `${c.title} için kaydın alındı. Bitirdiğinde ${g.job.title} ilanına uyumun %${g.before} → %${g.after} olacak.` : `${c.title} için kaydın alındı. Başarılar!`);
        api.rerender();
      });
    }
  });
}

// ---------- home ----------
export function homeView(root, api) {
  const s = state();
  const ranked = rankJobs(s.profile);
  const jobs = ranked.filter((r) => r.job.type === 'İş').slice(0, 4);
  const interns = ranked.filter((r) => r.job.type === 'Staj').slice(0, 6);
  const recs = recommendCourses(s.profile, 3);
  const strength = profileStrength(s);
  const apps = s.applications.slice().sort((a, b) => b.at - a.at).slice(0, 3);
  const interests = s.profile.interests || [];
  const goodCount = ranked.filter((r) => r.m.total >= 70).length;

  root.innerHTML = `<div class="page">
    <header class="page-head"><div><h1>${greeting()} ${esc(firstName(s.user.name))} 👋</h1><p>Profiline göre <b>${goodCount}</b> ilan %70 üzeri uyumlu.</p></div>
      <div class="strength card"><div class="st-top"><span>Profil gücü</span><b class="st-num">0%</b></div><div class="bar"><i data-w="${strength}"></i></div><small>${strength < 100 ? 'Daha fazla başvuru ve bilgi gücünü artırır.' : 'Profilin tam.'}</small></div></header>
    <section class="sec reveal">${sectionHead('İlgi alanların', 'Değiştirdiğinde liste yeniden sıralanır.')}
      <div class="chips big">${FIELDS.map((f) => interests.includes(f)
        ? `<button class="chip on" data-int="${f}">${f}<span>${icon('x', 12)}</span></button>`
        : `<button class="chip dashed" data-int="${f}">${icon('plus', 12)}${f}</button>`).join('')}</div></section>
    <section class="sec">${sectionHead('Sana uygun ilanlar', '', '<a class="link" href="#/ilanlar">Tümü ' + icon('arrow', 14) + '</a>')}
      <div class="grid2">${jobs.map((r, i) => jobCard(r, i)).join('')}</div></section>
    <section class="sec reveal">${sectionHead('Sana uygun stajlar', '', '<a class="link" href="#/stajlar">Tümü ' + icon('arrow', 14) + '</a>')}
      <div class="hscroll">${interns.map((r, i) => jobCard(r, i)).join('')}</div></section>
    <section class="sec reveal">${sectionHead('Eksiğini kapat', 'Eksik becerilerini kapatan eğitimler.', '<a class="link" href="#/egitimler">Tüm eğitimler ' + icon('arrow', 14) + '</a>')}
      <div class="grid3">${recs.map((r, i) => courseCard(r, s.enrolled, i)).join('') || '<p class="muted">Şu an önemli bir eksiğin görünmüyor.</p>'}</div></section>
    <section class="sec reveal">${sectionHead('Başvurularım', '', '<a class="link" href="#/basvurular">Hepsi ' + icon('arrow', 14) + '</a>')}
      <div class="card">${apps.map((a) => appRow(a)).join('') || '<p class="muted pad">Henüz başvurun yok.</p>'}</div></section>
  </div>`;
  countUp($('.st-num', root), strength, { ms: 1100, suffix: '%' });
  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-int]');
    if (!t) return;
    const f = t.dataset.int;
    const cur = state().profile.interests || [];
    store.patchProfile({ interests: cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f] });
    api.rerender();
  });
  bindCommon(root, api);
  after(root);
  setContext({ screen: 'home', top: jobs[0] });
}

// ---------- job lists ----------
export function listView(root, api, kind) {
  const s = state();
  const intern = kind === 'interns';
  const f = { type: 'Tümü', city: 'Tümü', remote: false, field: 'Tümü', ...s.filters };
  if (intern) f.type = 'Staj';
  const opt = (arr, v) => arr.map((x) => `<option ${x === v ? 'selected' : ''}>${x}</option>`).join('');
  root.innerHTML = `<div class="page"><header class="page-head"><div><h1>${intern ? 'Stajlar' : 'İlanlar'}</h1><p class="count"></p></div></header>
    <div class="filters card">
      ${intern ? '' : `<label>Tür<select data-f="type">${opt(['Tümü', 'İş', 'Staj'], f.type)}</select></label>`}
      <label>Şehir<select data-f="city">${opt(['Tümü', ...CITIES], f.city)}</select></label>
      <label>Alan<select data-f="field">${opt(['Tümü', ...FIELDS], f.field)}</select></label>
      <label class="check"><input type="checkbox" data-f="remote" ${f.remote ? 'checked' : ''}> Uzaktan</label>
    </div><div class="grid2 list"></div></div>`;
  const draw = (animate = true) => {
    const cur = { ...f, ...state().filters }; if (intern) cur.type = 'Staj';
    const res = rankJobs(state().profile, { type: cur.type, city: cur.city, remote: cur.remote, field: cur.field });
    $('.count', root).textContent = `${res.length} sonuç · uyuma göre sıralı`;
    $('.list', root).innerHTML = res.map((r, i) => jobCard(r, animate ? Math.min(i, 8) : 0)).join('') || '<div class="empty card">Bu filtrelerle ilan bulunamadı. Filtreleri gevşetmeyi dene.</div>';
    animateRings(root);
    return res;
  };
  const res = draw();
  root.addEventListener('change', (e) => {
    const el = e.target.closest('[data-f]');
    if (!el) return;
    store.set({ filters: { ...state().filters, [el.dataset.f]: el.type === 'checkbox' ? el.checked : el.value } });
    draw(false);
  });
  setContext({ screen: intern ? 'interns' : 'jobs', count: res.length, top: res[0] });
}

// ---------- job detail ----------
export function jobView(root, api, id) {
  const s = state();
  const job = JOBS.find((j) => j.id === id);
  if (!job) { root.innerHTML = '<div class="page"><div class="empty card">İlan bulunamadı. <a href="#/ilanlar">İlanlara dön</a></div></div>'; return; }
  const m = scoreJob(job, s.profile);
  const applied = store.hasApplied(job.id);
  const bar = (label, v) => `<div class="brow"><span>${label}</span><div class="bar"><i data-w="${v}"></i></div><b>%${v}</b></div>`;
  root.innerHTML = `<div class="page"><a class="back" href="#/${job.type === 'Staj' ? 'stajlar' : 'ilanlar'}">${icon('chevron', 14)} Listeye dön</a>
    <div class="detail">
      <div class="card d-main">
        <div class="d-head">${monogram(job.company, job.companyColor, 56)}<div><h1>${esc(job.title)}</h1><span>${esc(job.company)} · ${esc(job.city)}</span></div></div>
        <div class="badges"><span class="badge ${job.type === 'Staj' ? 'intern' : 'job'}">${job.type}</span><span class="badge soft">${job.workMode}</span><span class="badge soft">${job.level}</span>
          ${job.salaryRange ? `<span class="badge soft">${esc(job.salaryRange)}</span>` : ''}<span class="badge soft">${days(job.postedDaysAgo)}</span><span class="badge soft">${job.applicants} başvuru</span></div>
        <h3>Açıklama</h3><p>${esc(job.description)}</p>
        <h3>Sorumluluklar</h3><ul class="plain">${job.responsibilities.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
        <h3>İstenen beceriler</h3><div class="chips">${job.requiredSkills.map((k) => `<span class="chip ${m.matched.includes(k) ? 'ok' : 'amber'}">${esc(k)}</span>`).join('')}${job.niceSkills.map((k) => `<span class="chip ${m.niceMatched.includes(k) ? 'ok soft' : 'plain'}">${esc(k)} <small>tercih</small></span>`).join('')}</div>
      </div>
      <aside class="card d-side">
        <div class="d-score">${ring(m.total, 96)}<div><b>Uyum skorun</b><span>Profilin ve ilan becerileri üzerinden</span></div></div>
        <div class="breakdown">${bar('Beceri', m.parts.skill)}${bar('Seviye', m.parts.level)}${bar('Konum', m.parts.location)}</div>
        ${m.missing.length ? `<h4>Eksik beceriler</h4><div class="chips">${m.missing.map((k) => { const c = coursesFor(k)[0]; return `<a class="chip amber" href="#/egitimler" title="${c ? esc(c.title) : ''}">${esc(k)}</a>`; }).join('')}</div>` : '<p class="ok-line">Zorunlu becerilerin tamamı sende.</p>'}
        <button class="btn block" data-apply ${applied ? 'disabled' : ''}>${applied ? 'Başvuruldu ✓' : 'Başvur'}</button>
      </aside></div></div>`;
  $('[data-apply]', root).addEventListener('click', () => {
    store.set({ applications: [...state().applications, { jobId: job.id, at: Date.now(), status: 'Gönderildi' }] });
    applyModal(job, m, () => api.rerender());
    coachSay(`Başvurun ${job.company} için iletildi. Mülakat çağrısı gelirse hazırlanmana yardım ederim.`);
  });
  after(root);
  setContext({ screen: 'job', job, m });
}

// ---------- courses ----------
export function coursesView(root, api) {
  const s = state();
  const recs = recommendCourses(s.profile, 4);
  const recIds = new Set(recs.map((r) => r.course.id));
  const rest = COURSES.filter((c) => !recIds.has(c.id)).map((course) => ({ course, gain: courseGain(course, s.profile) }));
  root.innerHTML = `<div class="page"><header class="page-head"><div><h1>Eğitimler</h1><p>Eksiklerini kapatan öneriler üstte, katalog altta.</p></div></header>
    <section class="sec">${sectionHead('Sana önerilenler')}<div class="grid3">${recs.map((r, i) => courseCard(r, s.enrolled, i)).join('') || '<p class="muted">Şu an önemli bir eksiğin görünmüyor.</p>'}</div></section>
    <section class="sec reveal">${sectionHead('Katalog')}<div class="grid3">${rest.map((r, i) => courseCard(r, s.enrolled, i % 6)).join('')}</div></section></div>`;
  bindCommon(root, api);
  after(root);
  setContext({ screen: 'courses', top: recs[0] });
}

// ---------- applications ----------
export function appsView(root) {
  const apps = state().applications.slice().sort((a, b) => b.at - a.at);
  root.innerHTML = `<div class="page"><header class="page-head"><div><h1>Başvurularım</h1><p>${apps.length} başvuru</p></div></header>
    <div class="stack">${apps.map((a) => appRow(a, true)).join('') || '<div class="empty card">Henüz başvurun yok. <a href="#/ilanlar">İlanlara göz at</a></div>'}</div></div>`;
  setContext({ screen: 'apps', count: apps.length });
}

// ---------- profile ----------
const EDIT_FIELDS = {
  targetRoles: { label: 'Hedef roller' },
  skills: { label: 'Becerilerin', vocab: SKILL_VOCAB },
  missingSkills: { label: 'Eksiklerin', vocab: SKILL_VOCAB, tone: 'amber' },
  cities: { label: 'Şehirler', vocab: CITIES.filter((c) => c !== 'Uzaktan') },
};

export function profileView(root, api) {
  const s = state();
  const p = s.profile;
  const editor = (key) => {
    const cfg = EDIT_FIELDS[key];
    return `<div class="pf-block"><h3>${cfg.label}</h3><div class="chips">${(p[key] || []).map((v) => `<span class="chip ${cfg.tone || 'ok'}">${esc(v)}<button data-del="${key}" data-v="${esc(v)}" aria-label="Kaldır">${icon('x', 12)}</button></span>`).join('')}
      <input class="chip-input" data-add="${key}" ${cfg.vocab ? `list="dl-${key}"` : ''} placeholder="Ekle…" autocomplete="off">${cfg.vocab ? `<datalist id="dl-${key}">${cfg.vocab.map((v) => `<option value="${esc(v)}">`).join('')}</datalist>` : ''}</div></div>`;
  };
  root.innerHTML = `<div class="page"><header class="page-head"><div><h1>Profilim</h1><p>Koçun CV'nden ve görüşmenden çıkardığı profil. Düzenleyebilirsin.</p></div></header>
    <div class="card pf">
      <div class="pf-user">${monogram(s.user.name, '#0B1F44', 52)}<div><b>${esc(s.user.name)}</b><span>${esc(s.user.email || '')} · ${esc(s.user.status || '')}</span><small>${s.cv ? 'CV: ' + esc(s.cv.name) : ''}</small></div></div>
      <div class="pf-block"><h3>Özet</h3><textarea data-summary rows="3">${esc(p.summary || '')}</textarea></div>
      ${editor('targetRoles')}${editor('skills')}${editor('missingSkills')}${editor('cities')}
      <div class="pf-row">
        <label>Seviye<select data-level>${['Stajyer', 'Junior', 'Orta'].map((l) => `<option ${p.level === l ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="check"><input type="checkbox" data-remote ${p.remoteOk ? 'checked' : ''}> Uzaktan çalışabilirim</label>
        ${['İş', 'Staj'].map((t) => `<label class="check"><input type="checkbox" data-type="${t}" ${(p.jobTypes || []).includes(t) ? 'checked' : ''}> ${t}</label>`).join('')}
      </div></div></div>`;
  const refocus = (key) => { api.rerender(); setTimeout(() => document.querySelector(`[data-add="${key}"]`)?.focus(), 0); };
  root.addEventListener('click', (e) => {
    const d = e.target.closest('[data-del]');
    if (!d) return;
    const key = d.dataset.del;
    store.patchProfile({ [key]: (state().profile[key] || []).filter((x) => x !== d.dataset.v) });
    api.rerender();
  });
  root.addEventListener('keydown', (e) => {
    const inp = e.target.closest('[data-add]');
    if (!inp || e.key !== 'Enter') return;
    e.preventDefault();
    const key = inp.dataset.add;
    const v = inp.value.trim();
    const vocab = EDIT_FIELDS[key].vocab;
    if (!v || (vocab && !vocab.includes(v)) || (state().profile[key] || []).includes(v)) { inp.value = ''; return; }
    store.patchProfile({ [key]: [...(state().profile[key] || []), v] });
    refocus(key);
  });
  root.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-summary]')) store.patchProfile({ summary: t.value });
    else if (t.matches('[data-level]')) store.patchProfile({ level: t.value });
    else if (t.matches('[data-remote]')) store.patchProfile({ remoteOk: t.checked });
    else if (t.matches('[data-type]')) {
      const set = new Set(state().profile.jobTypes || []);
      t.checked ? set.add(t.dataset.type) : set.delete(t.dataset.type);
      store.patchProfile({ jobTypes: [...set] });
    }
  });
  setContext({ screen: 'profile' });
}

export { $$ };
