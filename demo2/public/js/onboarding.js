// Onboarding: 1) CV  2) meet the coach  3) profile analysis.
import * as store from './store.js';
import { SAMPLE_CVS } from '../data/sample-cvs.js';
import { extractSkills, interviewTurn, badgeText, onStatus } from './coach.js';
import { rankJobs } from './match.js';
import { esc, icon, logo, avatar, setAvatar, typewrite, countUp, sleep, $, $$, firstName } from './ui.js';

const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/';

async function readPdf(file) {
  const pdfjs = await import(PDFJS + 'pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.mjs';
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  let out = '';
  for (let p = 1; p <= Math.min(doc.numPages, 6); p++) {
    const page = await doc.getPage(p);
    out += (await page.getTextContent()).items.map((i) => i.str).join(' ') + '\n';
  }
  return out;
}

export function renderOnboarding(root) {
  const user = store.get().user;
  let step = 1;
  root.innerHTML = `<div class="ob">
    <header class="ob-top"><div class="l-wrap">${logo()}
      <ol class="stepper">${['CV', 'Koçla tanışma', 'Profil'].map((t, i) => `<li data-s="${i + 1}"><i>${i + 1}</i><span>${t}</span></li>`).join('')}</ol>
      <span class="ai-badge" data-badge>${esc(badgeText())}</span></div></header>
    <main class="ob-main" id="stage"></main></div>`;
  onStatus(() => { const b = $('[data-badge]', root); if (b) b.textContent = badgeText(); });
  const stage = $('#stage', root);
  const mark = () => $$('.stepper li', root).forEach((li) => {
    const n = Number(li.dataset.s);
    li.className = n < step ? 'done' : n === step ? 'current' : '';
  });
  const go = (n) => { step = n; mark(); stage.innerHTML = ''; [stepCv, stepCoach, stepAnalyze][n - 1](); window.scrollTo(0, 0); };

  // ----- step 1 -----
  function stepCv() {
    stage.innerHTML = `<section class="ob-card fade-in"><h1>CV'ni yükle</h1><p class="lead">PDF ya da metin dosyası bırak; Ece becerilerini çıkarsın.</p>
      <label class="drop" id="drop"><input type="file" accept=".pdf,.txt,application/pdf,text/plain" hidden>${icon('upload', 30)}<b>CV'ni buraya sürükle</b><span>ya da tıklayıp seç · PDF / TXT</span></label>
      <div class="or"><span>ya da</span></div>
      <div class="samples"><b>Örnek CV ile dene</b>
        ${Object.values(SAMPLE_CVS).map((c) => `<button class="sample card lift" data-sample="${c.id}"><span class="s-av">${esc(c.name[0])}</span><div><b>${esc(c.name)}</b><span>${esc(c.tagline)}</span></div>${icon('chevron', 16)}</button>`).join('')}</div>
      <p class="err" id="err" hidden></p></section>`;
    const input = $('input', stage);
    const drop = $('#drop', stage);
    const err = (m) => { const e = $('#err', stage); e.textContent = m; e.hidden = !m; };
    const handle = async (file) => {
      err('');
      try {
        const text = /pdf$/i.test(file.name) ? await readPdf(file) : await file.text();
        if (text.trim().length < 20) throw new Error('empty');
        scan({ name: file.name, text, skills: extractSkills(text) });
      } catch { err('Dosya okunamadı. Metin tabanlı bir PDF/TXT dene ya da örnek CV seç.'); }
    };
    input.addEventListener('change', () => input.files[0] && handle(input.files[0]));
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', (e) => e.dataTransfer.files[0] && handle(e.dataTransfer.files[0]));
    stage.addEventListener('click', (e) => {
      const b = e.target.closest('[data-sample]');
      if (!b) return;
      const c = SAMPLE_CVS[b.dataset.sample];
      store.set({ user: { ...store.get().user, name: c.form.name, status: c.form.status } });
      scan({ name: `${c.name.toLowerCase().replace(/\s+/g, '-')}-cv.pdf`, text: c.text, skills: c.skills, sampleId: c.id });
    });
  }

  async function scan(cv) {
    store.set({ cv, profile: null, onboarded: false, chat: [] });
    stage.innerHTML = `<section class="ob-card fade-in scan"><h1>CV okunuyor…</h1>
      <div class="doc"><div class="doc-name">${icon('file', 18)} ${esc(cv.name)}</div>${'<i class="ln"></i>'.repeat(9)}<span class="beam"></span></div>
      <p class="found" hidden><b data-n>0</b> beceri bulundu</p><div class="chips found-chips"></div>
      <button class="btn" id="next" hidden>Koçla tanış ${icon('arrow', 16)}</button></section>`;
    await sleep(1900);
    $('h1', stage).textContent = cv.skills.length ? 'CV okundu' : 'CV okundu, ama beceri bulamadım';
    $('.scan', stage).classList.add('done');
    const found = $('.found', stage); found.hidden = false;
    countUp($('[data-n]', stage), cv.skills.length, { ms: 900 });
    const wrap = $('.found-chips', stage);
    for (const s of cv.skills) { wrap.insertAdjacentHTML('beforeend', `<span class="chip ok pop">${esc(s)}</span>`); await sleep(110); }
    const next = $('#next', stage); next.hidden = false; next.classList.add('fade-in');
    next.addEventListener('click', () => go(2));
  }

  // ----- step 2 -----
  function stepCoach() {
    const s = store.get();
    const cv = s.cv || { text: '', skills: [] };
    stage.innerHTML = `<section class="ob-chat fade-in"><div class="big-av">${avatar(168, 'idle')}</div>
      <div class="chat-card card"><div class="msgs"></div><div class="qr"></div>
        <form class="composer"><input type="text" placeholder="Yanıtını yaz…" autocomplete="off" disabled aria-label="Yanıtın"><button aria-label="Gönder" disabled>${icon('send', 18)}</button></form></div></section>`;
    const sess = { form: s.user, cvText: cv.text, skills: cv.skills, sampleId: cv.sampleId, answers: [], history: [{ role: 'user', text: 'Merhaba, tanışma görüşmesini başlatalım.' }] };
    const msgs = $('.msgs', stage); const qr = $('.qr', stage); const inp = $('input', stage); const btn = $('.composer button', stage);
    const lock = (v) => { inp.disabled = v; btn.disabled = v; if (!v) inp.focus({ preventScroll: true }); };
    const scroll = () => { msgs.scrollTop = msgs.scrollHeight; };

    async function turn() {
      lock(true); qr.innerHTML = '';
      setAvatar(stage, 'thinking');
      const d = document.createElement('div'); d.className = 'msg coach typing'; d.innerHTML = '<span class="tdots"><i></i><i></i><i></i></span>';
      msgs.appendChild(d); scroll();
      const r = await interviewTurn(sess);
      d.classList.remove('typing'); d.textContent = '';
      setAvatar(stage, 'speaking');
      await typewrite(d, r.reply, { speed: 15, onTick: scroll });
      setAvatar(stage, 'idle');
      sess.history.push({ role: 'model', text: r.reply });
      if (r.done) {
        store.set({ profile: r.profile });
        await sleep(1100);
        go(3);
        return;
      }
      qr.innerHTML = (r.quickReplies || []).map((q) => `<button class="chip" data-q="${esc(q)}">${esc(q)}</button>`).join('');
      lock(false);
    }
    function answer(text) {
      const u = document.createElement('div'); u.className = 'msg user'; u.textContent = text; msgs.appendChild(u); scroll();
      sess.answers.push(text); sess.history.push({ role: 'user', text });
      inp.value = '';
      turn();
    }
    qr.addEventListener('click', (e) => { const q = e.target.closest('[data-q]'); if (q && !inp.disabled) answer(q.dataset.q); });
    $('.composer', stage).addEventListener('submit', (e) => { e.preventDefault(); const v = inp.value.trim(); if (v && !inp.disabled) answer(v); });
    turn();
  }

  // ----- step 3 -----
  async function stepAnalyze() {
    const s = store.get();
    const p = s.profile;
    const matches = rankJobs(p).filter((r) => r.m.total >= 60).length;
    stage.innerHTML = `<section class="ob-card fade-in analyze"><h1>Profilin hazırlanıyor</h1><p class="lead" id="phase">Becerilerin eşleniyor…</p>
      <div class="bar big"><i id="pb"></i></div>
      <div class="an-stats"><div><b data-a="0">0</b><span>Beceri</span></div><div><b data-a="1">0</b><span>Hedef rol</span></div><div><b data-a="2">0</b><span>Uyumlu ilan</span></div></div>
      <div class="chips" id="roles"></div><button class="btn" id="enter" hidden>Panele geç ${icon('arrow', 16)}</button></section>`;
    const vals = [p.skills.length, p.targetRoles.length, matches];
    requestAnimationFrame(() => { $('#pb', stage).style.width = '100%'; });
    const phases = ['Becerilerin eşleniyor…', 'Hedef roller belirleniyor…', 'İlanlar taranıyor…'];
    for (let i = 0; i < 3; i++) {
      $('#phase', stage).textContent = phases[i];
      countUp($(`[data-a="${i}"]`, stage), vals[i], { ms: 1000 });
      if (i === 1) $('#roles', stage).innerHTML = p.targetRoles.map((r) => `<span class="chip ok pop">${esc(r)}</span>`).join('');
      await sleep(1150);
    }
    $('h1', stage).textContent = `${firstName(s.user.name)}, profilin hazır`;
    $('#phase', stage).textContent = 'Seni panele götürüyorum…';
    store.set({ onboarded: true });
    const enter = $('#enter', stage); enter.hidden = false;
    enter.addEventListener('click', () => { location.hash = '#/panel'; });
    await sleep(1400);
    if (location.hash === '#/basla') location.hash = '#/panel';
  }

  const st = store.get();
  go(st.profile && !st.onboarded ? 3 : 1);
}
