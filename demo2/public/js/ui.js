// Small UI helpers: escaping, icons, animation primitives, modal.
export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion() ? Math.min(ms, 30) : ms));

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICONS = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/>',
  file: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  logout: '<path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M16 8l4 4-4 4M20 12H9"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  chat: '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  building: '<path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 10h5a1 1 0 0 1 1 1v10M2 21h20M8 8h2M8 12h2M8 16h2"/>',
  heart: '<path d="M12 20s-7-4.4-9-9.2C1.8 7.4 4 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3 0 5.2 2.9 4 6.3-2 4.8-9 9.2-9 9.2z"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  send: '<path d="M4 12l16-8-6 16-3-6.5z"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pin: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
};
export const icon = (name, size = 20) =>
  `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

export function monogram(company, color, size = 44) {
  const letters = company.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toLocaleUpperCase('tr');
  return `<span class="mono" style="--mc:${color};width:${size}px;height:${size}px;font-size:${Math.round(size * 0.36)}px">${esc(letters)}</span>`;
}

export function countUp(el, to, { ms = 900, from = 0, suffix = '', fmt } = {}) {
  const out = (v) => (fmt ? fmt(v) : Math.round(v).toLocaleString('tr-TR')) + suffix;
  if (reduceMotion() || from === to) { el.textContent = out(to); return; }
  const t0 = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - t0) / ms);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = out(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Types text into el; a newer call on the same el cancels the older one.
export async function typewrite(el, text, { speed = 14, onTick } = {}) {
  const token = Symbol();
  el._tw = token;
  if (reduceMotion()) { el.textContent = text; onTick?.(); return; }
  el.textContent = '';
  for (let i = 1; i <= text.length; i++) {
    if (el._tw !== token) return;
    el.textContent = text.slice(0, i);
    if (i % 3 === 0) onTick?.();
    await new Promise((r) => setTimeout(r, speed + (/[.,?!]/.test(text[i - 1]) ? 90 : 0)));
  }
  onTick?.();
}

let avatarSeq = 0;
export function avatar(size = 120, state = 'idle') {
  const id = `ag${++avatarSeq}`;
  return `<div class="avatar" data-state="${state}" style="--s:${size}px">
    <i class="halo"></i><i class="halo h2"></i>
    <svg viewBox="0 0 100 100" role="img" aria-label="Ece, kariyer koçu">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3FD9BB"/><stop offset="1" stop-color="#0A8F78"/></linearGradient></defs>
      <circle cx="50" cy="50" r="47" fill="url(#${id})"/>
      <circle cx="26" cy="58" r="6" fill="#fff" opacity=".16"/><circle cx="74" cy="58" r="6" fill="#fff" opacity=".16"/>
      <ellipse class="eye" cx="36" cy="44" rx="4.2" ry="5.8" fill="#fff"/><ellipse class="eye" cx="64" cy="44" rx="4.2" ry="5.8" fill="#fff"/>
      <path class="mouth" d="M37 61 Q50 72 63 61" stroke="#fff" stroke-width="4.2" stroke-linecap="round" fill="none"/>
    </svg>
    <span class="dots"><i></i><i></i><i></i></span></div>`;
}
export const setAvatar = (root, state) => $$('.avatar', root).forEach((a) => (a.dataset.state = state));

export function ring(score, size = 56) {
  const cls = score >= 80 ? 'hi' : score >= 60 ? 'mid' : 'lo';
  return `<div class="ring ${cls}" data-score="${score}" style="--rs:${size}px"><svg viewBox="0 0 44 44"><circle class="bg" cx="22" cy="22" r="18"/><circle class="fg" cx="22" cy="22" r="18" stroke-dasharray="113.1" stroke-dashoffset="113.1"/></svg><b>0</b></div>`;
}
export function animateRings(root = document) {
  $$('.ring:not([data-done])', root).forEach((r, i) => {
    r.dataset.done = '1';
    const score = Number(r.dataset.score);
    setTimeout(() => {
      r.querySelector('.fg').style.strokeDashoffset = String(113.1 * (1 - score / 100));
      countUp(r.querySelector('b'), score, { ms: 1000 });
    }, reduceMotion() ? 0 : 80 + i * 90);
  });
}
export function animateBars(root = document) {
  $$('.bar > i[data-w]', root).forEach((b, i) => setTimeout(() => (b.style.width = b.dataset.w + '%'), reduceMotion() ? 0 : 100 + i * 80));
}

let io;
export function observeReveal(root = document) {
  if (!io) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
  }
  $$('.reveal:not(.in)', root).forEach((el) => (reduceMotion() ? el.classList.add('in') : io.observe(el)));
}

export function modal(html, onMount) {
  const wrap = document.createElement('div');
  wrap.className = 'modal-wrap';
  wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  const close = () => { wrap.classList.remove('show'); setTimeout(() => wrap.remove(), 220); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => e.key === 'Escape' && close();
  wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('show'));
  onMount?.(wrap, close);
  return close;
}

export const logo = (cls = '') => `<a class="logo ${cls}" href="#/"><img src="assets/mark.svg" alt="" width="30" height="30"><span>Çalışıyorum</span></a>`;
export const firstName = (n) => String(n || '').trim().split(/\s+/)[0] || 'Merhaba';
