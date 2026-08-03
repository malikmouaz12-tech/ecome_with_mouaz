(() => {
  'use strict';

  const d = document;
  const body = d.body;
  const preloaderMarkup = '<div id="preloader" aria-label="Loading Mouaz Shabbir website">' +
    '<div class="preloader-photo"><img src="mouaz-photo.png" alt="Mouaz Shabbir"></div>' +
    '<div class="preloader-text">MOUAZ<span>.</span>SHABBIR</div>' +
    '<div class="preloader-bar"></div>' +
    '</div>';

  d.documentElement.classList.add('site-enhanced');

  function ensurePreloader() {
    if (!d.getElementById('preloader') && body) {
      body.insertAdjacentHTML('afterbegin', preloaderMarkup);
    }
  }

  function hidePreloader() {
    const pre = d.getElementById('preloader');
    if (pre) pre.classList.add('hide');
    if (body) body.classList.add('page-loaded');
  }

  function setupImages() {
    d.querySelectorAll('img[src$="mouaz-photo.png"]').forEach((img) => {
      img.decoding = 'async';
      img.loading = img.closest('.hero, #preloader') ? 'eager' : 'lazy';
      const markMissing = () => {
        const holder = img.closest('.photo-inner');
        if (holder) holder.classList.add('is-missing');
      };
      img.addEventListener('error', markMissing, { once: true });
      if (img.complete && img.naturalWidth === 0) markMissing();
    });
  }

  function setupNav() {
    const nav = d.querySelector('nav');
    const toggle = d.querySelector('.nav-toggle');
    const links = d.querySelector('.nav-links');
    const overlay = d.querySelector('.nav-overlay');
    if (!nav || !toggle || !links) return;

    if (!links.id) links.id = 'primaryNav';
    toggle.setAttribute('aria-controls', links.id);
    toggle.setAttribute('aria-expanded', 'false');
    if (overlay) overlay.setAttribute('aria-hidden', 'true');

    const close = () => {
      toggle.classList.remove('active');
      links.classList.remove('active');
      if (overlay) {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
      }
      toggle.setAttribute('aria-expanded', 'false');
      body && body.classList.remove('menu-open');
    };

    const open = () => {
      toggle.classList.add('active');
      links.classList.add('active');
      if (overlay) {
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
      }
      toggle.setAttribute('aria-expanded', 'true');
      body && body.classList.add('menu-open');
    };

    toggle.addEventListener('click', () => {
      links.classList.contains('active') ? close() : open();
    });
    overlay && overlay.addEventListener('click', close);
    links.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    d.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) close();
    });

    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function setupReveal() {
    const targets = d.querySelectorAll([
      '.stat-card', '.service-card', '.timeline-item', '.result-card', '.trust-card',
      '.course-card', '.price-card', '.roadmap-stage', '.practical-card', '.note-card',
      '.skill-group', '.contact-link'
    ].join(','));

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = Array.from((entry.target.parentElement && entry.target.parentElement.children) || []);
        const index = Math.max(0, siblings.indexOf(entry.target));
        window.setTimeout(() => entry.target.classList.add('visible'), Math.min(index * 65, 320));
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });

    targets.forEach((el) => observer.observe(el));
  }

  function setupCounters() {
    const statsSection = d.querySelector('.stats-section');
    if (!statsSection || !('IntersectionObserver' in window)) return;
    let done = false;
    const parse = (text) => {
      const match = text.trim().match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
      if (!match) return null;
      return { prefix: match[1], value: Number(match[2]), suffix: match[3] };
    };
    const run = () => {
      if (done) return;
      done = true;
      statsSection.querySelectorAll('.stat-num').forEach((node) => {
        const original = node.textContent.trim();
        const data = parse(original);
        if (!data || !Number.isFinite(data.value)) return;
        const duration = 1100;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(data.value * eased);
          node.textContent = data.prefix + value + data.suffix;
          if (progress < 1) requestAnimationFrame(tick);
          else node.textContent = original;
        };
        requestAnimationFrame(tick);
      });
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        run();
        observer.disconnect();
      }
    }, { threshold: 0.45 });
    observer.observe(statsSection);
  }

  function setupTransitions() {
    d.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('https://wa.me') || link.target === '_blank' || link.hasAttribute('download')) return;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        body && body.classList.remove('page-loaded');
        body && body.classList.add('page-leaving');
        window.setTimeout(() => { window.location.href = href; }, 260);
      });
    });
  }

  function patchCourseCartButtons() {
    if (typeof window.clearCart !== 'function' || typeof selectedCourses === 'undefined') return;

    window.clearCart = function clearCartPatched() {
      selectedCourses.length = 0;
      d.querySelectorAll('.btn-select.selected, .btn-icon-only.selected').forEach((btn) => {
        btn.classList.remove('selected');
        btn.textContent = '+';
        btn.setAttribute('title', 'Select for combined enquiry');
        btn.setAttribute('aria-label', 'Select course');
      });
      d.querySelectorAll('.course-card.selected').forEach((card) => card.classList.remove('selected'));
      if (typeof window.updateCartBar === 'function') window.updateCartBar();
    };
  }

  ensurePreloader();
  setupImages();
  setupNav();
  setupReveal();
  setupCounters();
  setupTransitions();
  patchCourseCartButtons();

  window.addEventListener('load', () => window.setTimeout(hidePreloader, 420));
  window.setTimeout(hidePreloader, 2400);
})();
