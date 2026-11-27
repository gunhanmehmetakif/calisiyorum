// Landing page: marketing sections + identity card (login / register).
import * as store from './store.js';
import { COURSES } from '../data/courses.js';
import { esc, icon, logo, countUp, observeReveal, $, $$, firstName } from './ui.js';
import { badgeText } from './coach.js';

const STEPS = [
  ['upload', 'CV\'ni yükle', 'PDF ya da metin yeterli. Becerilerin saniyeler içinde çıkarılır.'],
  ['chat', 'Ece ile tanış', 'Koçun üç kısa soruyla hedefini, şehir ve çalışma tercihini öğrenir.'],
  ['target', 'Uyumlu ilanları gör', 'İlan ve stajlar uyum skoruyla sıralanır; nedenini açıkça görürsün.'],
  ['book', 'Eksiğini kapat', 'Eksik becerin için ücretli ya da sponsorlu eğitim önerilir.'],
];

const FAQ = [
  ['Ücretsiz mi?', 'Adaylar için kayıt, CV analizi ve koç görüşmeleri ücretsizdir. Ücretli olan yalnızca isteğe bağlı eğitimlerdir.'],
  ['CV\'m kimlerle paylaşılır?', 'Sen bir ilana başvurmadıkça hiçbir firmayla paylaşılmaz. Başvurduğunda uyum raporunla birlikte iletilir.'],
  ['Öğrenciyim, staj bulabilir miyim?', 'Evet. Stajlar ayrı listelenir ve seviyene göre sıralanır.'],
  ['Uyum skoru nasıl hesaplanıyor?', 'Zorunlu ve tercih edilen beceriler, ilgi alanın, hedef rollerin ve şehir/uzaktan tercihin birlikte değerlendirilir.'],
];

export function renderLanding(root) {
  const s = store.get();
  const logged = Boolean(s.user);
  root.innerHTML = `
  <header class="l-nav"><div class="l-wrap">
    ${logo()}
    <nav><a href="#" data-go="how">Nasıl çalışır</a><a href="#" data-go="audiences">Firmalar için</a><a href="#" data-go="edu">Eğitimler</a></nav>
    <div class="l-nav-cta">${logged
      ? `<a class="btn small" href="#/${s.onboarded ? 'panel' : 'basla'}">Panele git</a>`
      : `<a class="btn ghost small" href="#" data-tab="login">Giriş yap</a><a class="btn small" href="#" data-tab="register">Ücretsiz kayıt ol</a>`}</div>
  </div></header>

  <section class="hero"><div class="l-wrap hero-grid">
    <div class="hero-copy">
      <span class="eyebrow">AI kariyer koçu ile</span>
      <h1>Yüzlerce ilan okuma. <em>Sana uyanlar</em> seni bulsun.</h1>
      <p class="lead">CV'ni yükle, koçun Ece ile üç kısa soruda tanış. İş ve staj ilanları sana uyum skoruyla gelsin, eksik becerilerin için de eğitim önerisi al.</p>
      <ul class="benefits">
        <li>${icon('check', 18)}<span>Her ilan için <b>neden uygun</b> olduğunu görürsün</span></li>
        <li>${icon('check', 18)}<span>Eksik becerini kapatan <b>eğitim</b> ve burs önerisi</span></li>
        <li>${icon('check', 18)}<span>Panelde seninle duran <b>kişisel asistan</b></span></li>
      </ul>
      <div class="stats">
        <div><b data-count="1240">0</b><span>Aktif ilan</span></div>
        <div><b data-count="380">0</b><span>Staj</span></div>
        <div><b data-count="95">0</b><span>Eğitim</span></div>
      </div>
    </div>
    <div class="auth card" id="auth">
      <div class="tabs" role="tablist"><button role="tab" data-tab="register" class="on">Kayıt ol</button><button role="tab" data-tab="login">Giriş yap</button></div>
      <form data-form="register" class="form">
        <label>Ad soyad<input name="name" placeholder="Elif Kaya" autocomplete="name"></label>
        <label>E-posta<input name="email" type="email" placeholder="ornek@eposta.com" autocomplete="email"></label>
        <label>Şifre<input name="pass" type="password" placeholder="••••••••" autocomplete="new-password"></label>
        <fieldset><legend>Durumun</legend><div class="seg">
          ${['Öğrenci', 'Yeni mezun', 'Deneyimli'].map((v, i) => `<label><input type="radio" name="status" value="${v}" ${i === 0 ? 'checked' : ''}><span>${v}</span></label>`).join('')}
        </div></fieldset>
        <button class="btn block">Ücretsiz kayıt ol</button>
      </form>
      <form data-form="login" class="form" hidden>
        <label>E-posta<input name="email" type="email" placeholder="ornek@eposta.com" autocomplete="email"></label>
        <label>Şifre<input name="pass" type="password" placeholder="••••••••" autocomplete="current-password"></label>
        <button class="btn block">Giriş yap</button>
      </form>
      <div class="auth-foot"><span>Demo: herhangi bir değerle çalışır.</span><a href="#" data-demo>Demo hesapla gir</a></div>
    </div>
  </div></section>

  <section class="l-sec" id="how"><div class="l-wrap">
    <div class="l-head reveal"><span class="eyebrow">Nasıl çalışır</span><h2>Dört adımda sana uygun işe</h2></div>
    <div class="steps">${STEPS.map(([ic, t, d], i) => `<div class="step card reveal" style="--i:${i}"><span class="step-n">${i + 1}</span><span class="step-ic">${icon(ic, 22)}</span><b>${t}</b><p>${d}</p></div>`).join('')}</div>
  </div></section>

  <section class="l-sec alt" id="audiences"><div class="l-wrap">
    <div class="l-head reveal"><span class="eyebrow">Herkes için</span><h2>Adaylar, firmalar ve sponsorlar aynı yerde</h2></div>
    <div class="aud">
      <div class="card aud-card reveal">${icon('user', 26)}<h3>Adaylar için</h3><p>Ücretsiz profil, koç desteği ve uyum skorlu ilanlar. Eksiğini nasıl kapatacağını bilirsin.</p><ul><li>Kişisel kariyer koçu</li><li>İş ve staj ilanları</li><li>Uyum raporuyla başvuru</li></ul></div>
      <div class="card aud-card reveal" style="--i:1">${icon('building', 26)}<h3>Firmalar için</h3><p>CV yığınları yerine ilanına gerçekten uyan, uyum raporu eklenmiş adaylar.</p><ul><li>Beceri bazlı ön eleme</li><li>Aday uyum raporu</li><li>Staj programı yönetimi</li></ul></div>
      <div class="card aud-card reveal" style="--i:2">${icon('heart', 26)}<h3>Sponsorlar için</h3><p>Eğitim bursu vererek yeteneklerin önünü aç; etkiyi şeffaf biçimde izle.</p><ul><li>Hedefli burs fonları</li><li>Katılım ve sonuç raporu</li><li>Marka görünürlüğü</li></ul></div>
    </div></div></section>

  <section class="l-sec" id="edu"><div class="l-wrap">
    <div class="l-head reveal"><span class="eyebrow">Eğitimler</span><h2>Eksiğini kapatan kısa eğitimler</h2></div>
    <div class="edu-strip">${COURSES.filter((c) => c.sponsored).concat(COURSES.slice(0, 2)).slice(0, 3).map((c, i) => `<div class="card edu reveal" style="--i:${i}"><b>${esc(c.title)}</b><span class="muted">${esc(c.provider)} · ${c.hours} saat</span><div class="edu-foot"><strong>${c.priceTL.toLocaleString('tr-TR')} TL</strong>${c.sponsored ? '<span class="badge sponsor">Sponsorlu burs</span>' : ''}</div></div>`).join('')}</div>
  </div></section>

  <section class="l-sec alt"><div class="l-wrap narrow">
    <div class="l-head reveal"><span class="eyebrow">SSS</span><h2>Sık sorulanlar</h2></div>
    <div class="faq reveal">${FAQ.map(([q, a]) => `<details><summary>${q}${icon('chevron', 16)}</summary><p>${a}</p></details>`).join('')}</div>
  </div></section>

  <footer class="l-foot"><div class="l-wrap">${logo('sm')}<span>© 2026 Çalışıyorum · Demo; tüm veriler kurgusaldır.</span><a href="#" data-reset>Demoyu sıfırla</a><span class="ai-badge">${esc(badgeText())}</span></div></footer>`;

  const setTab = (t) => {
    $$('.tabs button', root).forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
    $$('[data-form]', root).forEach((f) => (f.hidden = f.dataset.form !== t));
  };
  root.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); document.getElementById(go.dataset.go)?.scrollIntoView({ behavior: 'smooth' }); return; }
    const tab = e.target.closest('[data-tab]');
    if (tab) { e.preventDefault(); setTab(tab.dataset.tab); $('#auth', root).scrollIntoView({ behavior: 'smooth', block: 'center' }); if (tab.closest('.l-nav')) $('#auth input', root).focus({ preventScroll: true }); return; }
    if (e.target.closest('[data-demo]')) { e.preventDefault(); store.loginDemo(); location.hash = '#/panel'; return; }
    if (e.target.closest('[data-reset]')) { e.preventDefault(); store.reset(); location.hash = '#/'; location.reload(); }
  });
  root.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const email = String(f.get('email') || '').trim() || 'misafir@ornek.com';
    if (e.target.dataset.form === 'register') {
      const name = String(f.get('name') || '').trim() || 'Misafir';
      store.set({ ...store.get(), user: { name, email, status: f.get('status') || 'Öğrenci' }, onboarded: false, profile: null, cv: null, chat: [], applications: [], enrolled: [], filters: {} });
      location.hash = '#/basla';
    } else {
      const s = store.get();
      if (s.profile && s.onboarded) { location.hash = '#/panel'; return; }
      const nm = email.split('@')[0].replace(/[._-]+/g, ' ');
      store.set({ user: s.user || { name: nm.replace(/\b\w/g, (c) => c.toLocaleUpperCase('tr')), email, status: 'Öğrenci' } });
      location.hash = '#/basla';
    }
  });
  $$('[data-count]', root).forEach((el, i) => setTimeout(() => countUp(el, Number(el.dataset.count), { ms: 1400 }), 300 + i * 120));
  observeReveal(root);
  void firstName;
}
