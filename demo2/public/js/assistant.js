// Always-on coach panel (right column). Context-aware comments, quick replies, filter commands.
import * as store from './store.js';
import { assistantTurn, contextComment, quickFor } from './coach.js';
import { rankJobs } from './match.js';
import { $, esc, avatar, setAvatar, typewrite, icon, sleep } from './ui.js';

let root; let ctx = { screen: 'home' };
const seen = new Set();
let queue = Promise.resolve();

export function mountAssistant(el) {
  root = el;
  root.innerHTML = `
    <div class="coach-head">
      <span class="coach-av">${avatar(40, 'idle')}</span>
      <div class="coach-id"><b>Ece</b><small>Kişisel kariyer koçun</small></div>
      <button class="icon-btn" data-act="collapse" aria-label="Koç panelini daralt">${icon('panel', 18)}</button>
      <button class="icon-btn only-mobile" data-act="close" aria-label="Kapat">${icon('x', 18)}</button>
    </div>
    <div class="coach-body">
      <div class="msgs" aria-live="polite"></div>
      <div class="qr"></div>
      <form class="composer"><input type="text" placeholder="Ece'ye bir şey sor…" aria-label="Mesajın" autocomplete="off"><button aria-label="Gönder">${icon('send', 18)}</button></form>
    </div>
    <button class="coach-rail" data-act="expand" aria-label="Koçu aç"><span class="coach-av">${avatar(40, 'idle')}</span></button>`;
  $('.composer', root).addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = e.target.querySelector('input');
    const v = inp.value.trim();
    if (v) { inp.value = ''; ask(v); }
  });
  root.addEventListener('click', (e) => {
    const qr = e.target.closest('[data-q]');
    if (qr) return ask(qr.dataset.q);
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'collapse') setCollapsed(true);
    if (act === 'expand') setCollapsed(false);
    if (act === 'close') setSheet(false);
  });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-coach-fab]')) setSheet(true); });
  renderHistory();
  renderQuick(quickFor(ctx));
}

function setCollapsed(v) { document.body.classList.toggle('coach-collapsed', v); store.set({ coachOpen: !v }); }
function setSheet(v) { document.body.classList.toggle('coach-sheet', v); if (v) document.body.classList.remove('coach-unread'); }
export const openCoach = () => { setCollapsed(false); setSheet(true); };

const msgsEl = () => $('.msgs', root);
const scroll = () => { const m = msgsEl(); m.scrollTop = m.scrollHeight; };

function renderHistory() {
  const m = msgsEl();
  m.innerHTML = '';
  store.get().chat.forEach((c) => { const d = document.createElement('div'); d.className = `msg ${c.role === 'user' ? 'user' : 'coach'}`; d.textContent = c.text; m.appendChild(d); });
  scroll();
}

function renderQuick(list) {
  $('.qr', root).innerHTML = (list || []).map((q) => `<button class="chip" data-q="${esc(q)}">${esc(q)}</button>`).join('');
}

function persist(role, text) {
  store.set({ chat: [...store.get().chat, { role, text }].slice(-40) });
}

function say(text, quick) {
  queue = queue.then(async () => {
    const av = $$av();
    setAvatar(root, 'thinking');
    const d = document.createElement('div');
    d.className = 'msg coach typing';
    d.innerHTML = '<span class="tdots"><i></i><i></i><i></i></span>';
    msgsEl().appendChild(d); scroll();
    await sleep(450);
    d.classList.remove('typing'); d.textContent = '';
    setAvatar(root, 'speaking');
    await typewrite(d, text, { speed: 11, onTick: scroll });
    setAvatar(root, 'idle');
    persist('model', text);
    if (quick) renderQuick(quick);
    if (!document.body.classList.contains('coach-sheet')) document.body.classList.add('coach-unread');
    void av;
  });
  return queue;
}
const $$av = () => root.querySelector('.avatar');

export function setContext(c) {
  ctx = c;
  renderQuick(quickFor(c));
  const key = c.screen === 'job' ? `job:${c.job.id}` : c.screen;
  if (seen.has(key)) return;
  seen.add(key);
  const s = store.get();
  const text = contextComment({ ...c, userName: s.user?.name }, s.profile);
  if (text) say(text, quickFor(c));
}

export function applyFilters(f) {
  const cur = { ...store.get().filters };
  if ('jobTypes' in f) cur.type = f.jobTypes?.length === 1 ? f.jobTypes[0] : 'Tümü';
  if ('cities' in f) cur.city = f.cities?.[0] || 'Tümü';
  if ('remoteOk' in f) cur.remote = Boolean(f.remoteOk);
  if ('interests' in f) cur.field = f.interests?.[0] || 'Tümü';
  store.set({ filters: cur });
  const target = cur.type === 'Staj' ? '#/stajlar' : '#/ilanlar';
  if (location.hash === target) window.dispatchEvent(new Event('hashchange')); else location.hash = target;
}

async function ask(text) {
  const m = msgsEl();
  const u = document.createElement('div');
  u.className = 'msg user'; u.textContent = text; m.appendChild(u); scroll();
  persist('user', text);
  renderQuick([]);
  const s = store.get();
  const history = s.chat.slice(-8).map((c) => ({ role: c.role === 'user' ? 'user' : 'model', text: c.text }));
  setAvatar(root, 'thinking');
  const topJobs = rankJobs(s.profile).slice(0, 5);
  const r = await assistantTurn({ text, ctx: { ...ctx, topJobs }, profile: s.profile, name: s.user?.name, history });
  await say(r.reply, r.quickReplies?.length ? r.quickReplies : quickFor(ctx));
  if (r.filters && Object.keys(r.filters).length) applyFilters(r.filters);
  if (r.action === 'openJob' && r.targetId) location.hash = `#/ilan/${r.targetId}`;
  if (r.action === 'openCourse') location.hash = '#/egitimler';
}

export const coachSay = say;
export const resetAssistant = () => { seen.clear(); if (root) renderHistory(); };
