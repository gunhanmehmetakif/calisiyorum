(() => {
  'use strict';

  const deck = document.getElementById('deck');
  const slides = [...document.querySelectorAll('.slide')];
  const nav = document.querySelector('.deck-nav');
  const countLabel = document.getElementById('page-count');
  const progressBar = document.getElementById('progress-bar');
  const prevButton = document.getElementById('prev');
  const nextButton = document.getElementById('next');
  const printMode = new URLSearchParams(location.search).has('print');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let activeTimeline = null;

  function formatCount(element, fraction = 1) {
    const value = Number(element.dataset.value);
    const decimals = Number(element.dataset.decimals || 0);
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    const number = (value * fraction).toLocaleString('tr-TR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    element.textContent = `${prefix}${number}${suffix}`;
  }

  function completeSlide(slide) {
    slide.querySelectorAll('.count').forEach(element => formatCount(element));
    slide.querySelectorAll('.loop-arrows path').forEach(path => {
      path.style.strokeDashoffset = '0';
    });
    slide.querySelectorAll('.bar').forEach(bar => {
      bar.style.transform = 'scaleX(1)';
    });
  }

  function scaleDeck() {
    if (printMode) return;
    const scale = Math.min(innerWidth / 1920, innerHeight / 1080);
    deck.style.transform = `translate(${(innerWidth - 1920 * scale) / 2}px, ${(innerHeight - 1080 * scale) / 2}px) scale(${scale})`;
  }

  function animateSlide(slide) {
    completeSlide(slide);
    if (reducedMotion || typeof gsap === 'undefined') return;
    activeTimeline?.kill();
    const title = slide.querySelector('h1, h2');
    const eyebrow = slide.querySelector('.section-tag, .eyebrow');
    const otherReveals = [...slide.querySelectorAll('.reveal')].filter(el => el !== title && el !== eyebrow);
    const cards = [...slide.querySelectorAll('.reveal-card')];
    const numbers = [...slide.querySelectorAll('.count')];
    const arrows = [...slide.querySelectorAll('.loop-arrows path')];
    const bars = [...slide.querySelectorAll('.bar')];
    const rings = [...slide.querySelectorAll('.match-ring')];
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    activeTimeline = timeline;
    if (eyebrow) timeline.fromTo(eyebrow, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .48 }, 0);
    if (title) timeline.fromTo(title, { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: .78 }, .08);
    if (otherReveals.length) timeline.fromTo(otherReveals, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .62, stagger: .1 }, .24);
    if (cards.length) timeline.fromTo(cards, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: .68, stagger: .105 }, .3);
    numbers.forEach((element, index) => {
      const counter = { progress: 0 };
      timeline.to(counter, { progress: 1, duration: .9, onUpdate: () => formatCount(element, counter.progress) }, .48 + index * .07);
    });
    arrows.forEach((path, index) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      timeline.to(path, { strokeDashoffset: 0, duration: .52 }, .44 + index * .16);
    });
    bars.forEach((bar, index) => {
      timeline.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: .8 }, .52 + index * .12);
    });
    rings.forEach((ring, index) => {
      const target = Number(ring.dataset.target || ring.style.getPropertyValue('--pct'));
      ring.dataset.target = target;
      const progress = { value: 0 };
      timeline.to(progress, {
        value: target,
        duration: .9,
        onUpdate: () => ring.style.setProperty('--pct', progress.value),
        onComplete: () => ring.style.setProperty('--pct', target)
      }, .48 + index * .07);
    });
  }

  function showSlide(index, updateHash = true) {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    if (activeTimeline) activeTimeline.kill();
    slides.forEach((slide, position) => {
      slide.classList.toggle('active', position === next);
      slide.setAttribute('aria-hidden', position === next ? 'false' : 'true');
    });
    current = next;
    countLabel.textContent = `${next + 1} / ${slides.length}`;
    progressBar.style.width = `${((next + 1) / slides.length) * 100}%`;
    prevButton.disabled = next === 0;
    nextButton.disabled = next === slides.length - 1;
    animateSlide(slides[next]);
    if (updateHash && location.hash !== `#${next + 1}`) {
      history.replaceState(null, '', `#${next + 1}`);
    }
  }

  function hashIndex() {
    const value = Number.parseInt(location.hash.slice(1), 10);
    return Number.isFinite(value) ? value - 1 : 0;
  }

  if (printMode) {
    document.documentElement.classList.add('print-mode');
    slides.forEach(slide => completeSlide(slide));
    nav.hidden = true;
    return;
  }

  addEventListener('resize', scaleDeck);
  addEventListener('hashchange', () => showSlide(hashIndex(), false));
  addEventListener('keydown', event => {
    if (['ArrowRight', ' ', 'PageDown'].includes(event.key)) {
      event.preventDefault();
      showSlide(current + 1);
    } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      showSlide(current - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      showSlide(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      showSlide(slides.length - 1);
    } else if (event.key.toLowerCase() === 'f') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.();
    }
  });
  deck.addEventListener('click', event => {
    if (event.target.closest('a, button')) return;
    showSlide(current + 1);
  });
  prevButton.addEventListener('click', () => showSlide(current - 1));
  nextButton.addEventListener('click', () => showSlide(current + 1));
  scaleDeck();
  showSlide(hashIndex(), false);
})();
