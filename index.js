/*!
 * Coffee grow — Site-wide JavaScript
 * スクロールリビール · ヘッダー · ハンバーガー · トップ戻る · パラックス · 淹れ方ナビ · プログレスバー
 */
(function () {
  'use strict';

  /* ── Utilities ──────────────────────────────────────── */
  const $  = id => document.getElementById(id);
  const $$ = s  => Array.from(document.querySelectorAll(s));

  // rAF-throttled scroll handler (one RAF per scroll burst)
  let _rafPending = false;
  const scrollHandlers = [];
  window.addEventListener('scroll', () => {
    if (_rafPending) return;
    _rafPending = true;
    requestAnimationFrame(() => {
      scrollHandlers.forEach(fn => fn());
      _rafPending = false;
    });
  }, { passive: true });
  function onScroll(fn) { scrollHandlers.push(fn); }

  /* ── Sticky header ──────────────────────────────────── */
  const header = $('siteHeader');
  if (header) {
    onScroll(() => header.classList.toggle('scrolled', window.scrollY > 60));
  }

  /* ── Back-to-top button ─────────────────────────────── */
  const backTop = $('backTop');
  if (backTop) {
    window.addEventListener('scroll', () => {
      const show = window.scrollY > 500;
      backTop.classList.toggle('v',  show);
      backTop.classList.toggle('in', show);
    }, { passive: true });
    backTop.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );
  }

  /* ── Hamburger / SP-nav ─────────────────────────────── */
  const hamburger = $('hamburger');
  const spNav     = $('spNav');

  function closeNav() {
    if (hamburger) hamburger.classList.remove('open');
    if (spNav)     spNav.classList.remove('open');
    document.body.style.overflow = '';
  }
  window.closeNav = closeNav; // expose for legacy inline onclick

  if (hamburger && spNav) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      spNav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // Close when a nav link is clicked
    $$('#spNav a').forEach(a => a.addEventListener('click', closeNav));
    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && hamburger.classList.contains('open')) closeNav();
    });
  }

  /* ── Scroll Reveal ──────────────────────────────────── */
  // Supports both class conventions: .reveal→.v  and  .sr→.in
  const revealEls = $$('.reveal, .reveal-left, .reveal-right, .sr, .sr-l, .sr-r');
  if (revealEls.length) {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add('v', 'in');
        revealIO.unobserve(target); // animate only once
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -48px 0px' });
    revealEls.forEach(el => revealIO.observe(el));
  }

  /* ── Hero Parallax (index.html) ─────────────────────── */
  const heroBg = $('heroBg');
  if (heroBg) {
    onScroll(() => {
      heroBg.style.transform = `translateY(${window.scrollY * 0.28}px)`;
    });
  }

  /* ── Reading Progress Bar ───────────────────────────── */
  const progressBar = document.createElement('div');
  progressBar.setAttribute('aria-hidden', 'true');
  progressBar.style.cssText =
    'position:fixed;top:0;left:0;z-index:9999;height:2px;width:0%;' +
    'background:linear-gradient(90deg,#be6318,#f0b96a);' +
    'pointer-events:none;transition:width .12s linear;';
  document.body.prepend(progressBar);
  window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    progressBar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
  }, { passive: true });

  /* ── Smooth internal anchor scroll ──────────────────── */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 80,
      behavior: 'smooth'
    });
  });

  /* ── Lazy-load polyfill for older Safari ────────────── */
  if ('loading' in HTMLImageElement.prototype === false) {
    const imgs = $$('img[loading="lazy"]');
    const lazyIO = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        if (target.dataset.src) target.src = target.dataset.src;
        lazyIO.unobserve(target);
      });
    });
    imgs.forEach(img => lazyIO.observe(img));
  }

  /* ── Image load error → fallback ───────────────────── */
  $$('img[data-fallback]').forEach(img => {
    img.addEventListener('error', function () {
      if (this.dataset.fallback && this.src !== this.dataset.fallback) {
        this.src = this.dataset.fallback;
      }
    }, { once: true });
  });

  /* ── Brew Method Navigation (brew.html) ─────────────── */
  function scrollToMethod(id) {
    const target = $(id);
    if (!target) return;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 80,
      behavior: 'smooth'
    });
    $$('.brew-nav-item').forEach(b => {
      b.classList.toggle('active',
        (b.getAttribute('onclick') || b.dataset.method || '').includes(id)
      );
    });
  }
  window.scrollToMethod = scrollToMethod; // expose for inline onclick

  // Scroll-spy: highlight brew nav based on viewport position
  const brewSections = ['drip','french','siphon','cold','espresso','moka']
    .map($).filter(Boolean);
  if (brewSections.length) {
    const spyIO = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        $$('.brew-nav-item').forEach(b => {
          b.classList.toggle('active',
            (b.getAttribute('onclick') || b.dataset.method || '').includes(target.id)
          );
        });
      });
    }, { threshold: 0.35, rootMargin: '-80px 0px 0px 0px' });
    brewSections.forEach(s => spyIO.observe(s));
  }

  /* ── Number counter animation ───────────────────────── */
  // Elements with data-count="70" will count up when visible
  const counters = $$('[data-count]');
  if (counters.length) {
    const counterIO = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        const end = parseInt(target.dataset.count, 10);
        const duration = 1200;
        const start = performance.now();
        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          target.textContent = Math.round(eased * end);
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        counterIO.unobserve(target);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => counterIO.observe(el));
  }

})();
