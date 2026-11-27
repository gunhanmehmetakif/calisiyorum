// Hash router + app shell.
import * as store from './js/store.js';
import { loadStatus, badgeText, onStatus } from './js/coach.js';
import { mountAssistant, resetAssistant } from './js/assistant.js';
import { renderLanding } from './js/landing.js';
import { renderOnboarding } from './js/onboarding.js';
import { homeView, listView, jobView, coursesView, appsView, profileView } from './js/views.js';
import { JOBS } from './data/jobs.js';
import { esc, icon, logo, avatar, monogram, $, $$ } from './js/ui.js';

const app = document.getElementById('app');
let mode = null;

const NAV = [
  ['panel', 'Ana sayfa', 'Ana', 'home'], ['ilanlar', 'İlanlar', 'İlanlar', 'briefcase'], ['stajlar', 'Stajlar', 'Staj', 'spark'],
  ['egitimler', 'Eğitimler', 'Eğitim', 'book'], ['basvurular', 'Başvurularım', 'Başvuru', 'file'], ['profil', 'Profilim', 'Profil', 'user'],
];

function buildShell() {
  const s = store.get();
  app.innerHTML = `<div class="shell">
    <aside class="side">${logo()}
      <nav>${NAV.map(([h, full, short, ic]) => `<a href="#/${h}" data-nav="${h}">${icon(ic, 20)}<span class="full">${full}</span><span class="short">${short}</span></a>`).join('')}</nav>
      <div class="side-foot"><div class="me">${monogram(s.user.name, '#0B1F44', 36)}<div><b>${esc(s.user.name)}</b><span>${esc(s.user.status || '')}</span></div></div>
        <button class="side-btn" data-logout>${icon('logout', 18)}<span>Çıkış yap</span></button><a class="reset" href="#" data-reset>Demoyu sıfırla</a></div>
    </aside>
    <main class="center"><div class="topbar"><span class="ai-badge" data-badge>${esc(badgeText())}</span></div><div id="view"></div></main>
    <aside class="coach" id="coach"></aside></div>
    <button class="coach-fab" data-coach-fab aria-label="Koçu aç">${avatar(48, 'idle')}<i class="unread"></i></button>
    <div class="sheet-backdrop" data-sheet-close></div>`;
  mountAssistant($('#coach'));
}

app.addEventListener('click', (e) => {
  if (e.target.closest('[data-logout]')) { store.reset(); resetAssistant(); mode = null; document.body.className = ''; location.hash = '#/'; }
  if (e.target.closest('[data-reset]')) { e.preventDefault(); store.reset(); location.hash = '#/'; location.reload(); }
  if (e.target.closest('[data-sheet-close]')) document.body.classList.remove('coach-sheet');
});
onStatus(() => $$('[data-badge]').forEach((b) => (b.textContent = badgeText())));

const SHELL_ROUTES = { panel: homeView, ilanlar: (r, a) => listView(r, a, 'jobs'), stajlar: (r, a) => listView(r, a, 'interns'), egitimler: coursesView, basvurular: appsView, profil: profileView };

function setMode(m) {
  if (mode === m) return false;
  mode = m;
  document.body.className = '';
  document.body.dataset.mode = m;
  return true;
}

function route() {
  const s = store.get();
  const [page = '', arg] = location.hash.replace(/^#\/?/, '').split('/');
  window.scrollTo(0, 0);

  if (!page) { setMode('landing'); document.title = 'Çalışıyorum — Sana uyan iş ve stajlar'; app.innerHTML = ''; return renderLanding(app); }
  if (page === 'basla') {
    if (!s.user) { location.hash = '#/'; return; }
    setMode('onboarding'); document.title = 'Hoş geldin — Çalışıyorum'; app.innerHTML = ''; return renderOnboarding(app);
  }
  if (!s.user) { location.hash = '#/'; return; }
  if (!s.onboarded || !s.profile) { location.hash = '#/basla'; return; }

  const isJob = page === 'ilan';
  const render = isJob ? (r, a) => jobView(r, a, arg) : SHELL_ROUTES[page];
  if (!render) { location.hash = '#/panel'; return; }
  if (setMode('shell') || !$('#view')) { buildShell(); if (!s.coachOpen) document.body.classList.add('coach-collapsed'); }
  $$('[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === (isJob ? sectionOf(arg) : page)));
  const titles = { panel: 'Ana sayfa', ilanlar: 'İlanlar', stajlar: 'Stajlar', egitimler: 'Eğitimler', basvurular: 'Başvurularım', profil: 'Profilim', ilan: 'İlan' };
  document.title = `${titles[page]} — Çalışıyorum`;

  const view = $('#view');
  const draw = () => {
    view.innerHTML = '';
    const host = document.createElement('div');
    view.appendChild(host);
    render(host, { rerender });
  };
  function rerender() { const y = window.scrollY; draw(); window.scrollTo(0, y); }
  draw();
}

const sectionOf = (id) => (JOBS.find((j) => j.id === id)?.type === 'Staj' ? 'stajlar' : 'ilanlar');

window.addEventListener('hashchange', route);
loadStatus().finally(route);
