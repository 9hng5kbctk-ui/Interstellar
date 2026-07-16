/**
 * Interstellar — interactions, starfield, scroll effects, spaceman cursor
 */

(function () {
  'use strict';

  // ----- Year in footer -----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Spaceman cursor is handled by the inline script in index.html

  // ----- Entrance: gate stars + Earth orbit + music boom -----
  (function initEntrance() {
    const audio = document.getElementById('bg-music');
    const gate = document.getElementById('enter-gate');
    const enterPlay = document.getElementById('enter-play');
    const statusEl = document.getElementById('music-status');
    const mini = document.getElementById('mini-player');
    const miniToggle = document.getElementById('mini-toggle');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    const volume = document.getElementById('mini-volume');
    const miniTitle = document.getElementById('mini-title');
    const flash = document.getElementById('enter-flash');
    const gateCanvas = document.getElementById('gate-stars');

    if (!gate) return;

    document.body.style.overflow = 'hidden';
    if (miniTitle) miniTitle.textContent = 'Interstellar';
    if (audio) audio.volume = volume ? Number(volume.value) : 0.7;

    // Dense twinkling starfield on the pure black gate
    if (gateCanvas && gateCanvas.getContext) {
      const gctx = gateCanvas.getContext('2d');
      let gw = 0;
      let gh = 0;
      let stars = [];
      let gateRaf = null;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function sizeGate() {
        gw = window.innerWidth;
        gh = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        gateCanvas.width = gw * dpr;
        gateCanvas.height = gh * dpr;
        gateCanvas.style.width = gw + 'px';
        gateCanvas.style.height = gh + 'px';
        gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.min(320, Math.floor((gw * gh) / 4500));
        stars = [];
        for (let i = 0; i < count; i++) {
          stars.push({
            x: Math.random() * gw,
            y: Math.random() * gh,
            r: Math.random() * 1.6 + 0.2,
            a: Math.random() * 0.7 + 0.25,
            tw: Math.random() * Math.PI * 2,
            sp: 0.01 + Math.random() * 0.03,
            warm: Math.random() > 0.9,
            bright: Math.random() > 0.97,
          });
        }
      }

      function drawGateStars(t) {
        if (gate.classList.contains('is-hidden')) {
          if (gateRaf) cancelAnimationFrame(gateRaf);
          return;
        }
        gctx.clearRect(0, 0, gw, gh);
        gctx.fillStyle = '#000';
        gctx.fillRect(0, 0, gw, gh);

        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const tw = reduce ? 1 : 0.45 + 0.55 * Math.sin(t * s.sp + s.tw);
          const alpha = s.a * tw;

          if (s.bright) {
            gctx.beginPath();
            gctx.fillStyle = 'rgba(255,255,255,' + alpha * 0.15 + ')';
            gctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
            gctx.fill();
          }

          if (s.warm) {
            gctx.fillStyle = 'rgba(251, 191, 36,' + alpha + ')';
          } else if (s.r > 1.2) {
            gctx.fillStyle = 'rgba(196, 181, 253,' + alpha + ')';
          } else {
            gctx.fillStyle = 'rgba(255, 255, 255,' + alpha + ')';
          }
          gctx.beginPath();
          gctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          gctx.fill();
        }
        gateRaf = requestAnimationFrame(drawGateStars);
      }

      sizeGate();
      gateRaf = requestAnimationFrame(drawGateStars);
      window.addEventListener(
        'resize',
        function () {
          sizeGate();
        },
        { passive: true }
      );
    }

    function showStatus(msg) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.classList.remove('hidden');
    }

    function updateToggleUI(playing) {
      if (iconPlay) iconPlay.classList.toggle('hidden', playing);
      if (iconPause) iconPause.classList.toggle('hidden', !playing);
    }

    function boomAndEnter() {
      if (flash) {
        flash.classList.remove('is-boom');
        // reflow to restart animation
        void flash.offsetWidth;
        flash.classList.add('is-boom');
      }
      gate.classList.add('is-leaving');
      window.setTimeout(function () {
        gate.classList.add('is-hidden');
        document.body.style.overflow = '';
        if (mini) mini.classList.remove('hidden');
      }, 550);
    }

    async function tryPlay() {
      if (!audio) return false;
      try {
        await audio.play();
        updateToggleUI(true);
        return true;
      } catch (err) {
        updateToggleUI(false);
        return false;
      }
    }

    function onMissingFile() {
      showStatus(
        'Add your track as music/song.mp3 and re-upload — then Enter will blast the song.'
      );
    }

    if (audio) {
      audio.addEventListener('error', function () {
        /* message shown when user hits enter */
      });
    }

    if (enterPlay) {
      enterPlay.addEventListener('click', async function () {
        enterPlay.disabled = true;
        const ok = await tryPlay();
        // Always enter the site on click — boom either way
        boomAndEnter();
        if (!ok) {
          // Soft message only if we know file is missing
          if (audio && (audio.error || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE)) {
            // Mini player still visible; user may add file later
            onMissingFile();
          }
        }
        window.setTimeout(function () {
          enterPlay.disabled = false;
        }, 800);
      });
    }

    if (miniToggle && audio) {
      miniToggle.addEventListener('click', async function () {
        if (audio.paused) {
          const ok = await tryPlay();
          if (!ok) onMissingFile();
        } else {
          audio.pause();
          updateToggleUI(false);
        }
      });
    }

    if (volume && audio) {
      volume.addEventListener('input', function () {
        audio.volume = Number(volume.value);
      });
    }

    if (audio) {
      audio.addEventListener('play', function () {
        updateToggleUI(true);
      });
      audio.addEventListener('pause', function () {
        updateToggleUI(false);
      });
    }
  })();

  // ----- Header scroll state -----
  const header = document.getElementById('site-header');
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  // ----- Mobile nav -----
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('hidden') === false;
      navToggle.setAttribute('aria-expanded', String(open));
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ----- Smooth nav active state (optional highlight) -----
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('#nav-menu a.nav-link');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('id');
          navLinks.forEach((a) => {
            const href = a.getAttribute('href');
            a.classList.toggle('text-earth-amber', href === `#${id}`);
            a.classList.toggle('text-white/70', href !== `#${id}`);
          });
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  // ----- Scroll reveal -----
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              obs.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('visible'));
    }

    // Reveal hero items quickly on load
    requestAnimationFrame(() => {
      document.querySelectorAll('#hero .reveal').forEach((el) => {
        el.classList.add('visible');
      });
    });
  }

  // ----- Player tabs (Spotify / YouTube) -----
  const playerTabs = document.querySelectorAll('.player-tab');
  const spotifyWrap = document.querySelector('.player-embed');
  const youtubeEmbed = document.getElementById('youtube-embed');

  playerTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-player');
      playerTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      if (target === 'youtube') {
        if (spotifyWrap) spotifyWrap.classList.add('hidden');
        if (youtubeEmbed) youtubeEmbed.classList.remove('hidden');
      } else {
        if (spotifyWrap) spotifyWrap.classList.remove('hidden');
        if (youtubeEmbed) youtubeEmbed.classList.add('hidden');
      }
    });
  });

  // ----- Newsletter form (demo) -----
  const form = document.getElementById('newsletter-form');
  const formMessage = document.getElementById('form-message');

  if (form && formMessage) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('#email');
      const value = email && email.value ? email.value.trim() : '';

      if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        formMessage.textContent = 'Please enter a valid email address.';
        formMessage.className = 'mt-4 text-sm text-red-400';
        return;
      }

      formMessage.textContent = 'You\'re in orbit. Welcome to the list.';
      formMessage.className = 'mt-4 text-sm text-earth-moss';
      form.reset();
    });
  }

  // ----- Gallery lightbox -----
  const lightbox = document.getElementById('lightbox');
  const lightboxVisual = document.getElementById('lightbox-visual');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const galleryItems = document.querySelectorAll('.gallery-item');

  const galleryStyles = {
    'Stage lights — Portland': 'gallery-bg-1',
    'Forest sessions': 'gallery-bg-2',
    'Nebula vinyl art': 'gallery-bg-3',
    'Backstage quiet': 'gallery-bg-4',
    'Horizon soundcheck': 'gallery-bg-5',
    'Crowd under stars': 'gallery-bg-6',
  };

  function openLightbox(title) {
    if (!lightbox || !lightboxVisual || !lightboxCaption) return;
    const cls = galleryStyles[title] || 'gallery-bg-1';
    lightboxVisual.className = 'lightbox-visual ' + cls;
    lightboxCaption.textContent = title;
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lightboxClose && lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
  }

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      openLightbox(item.getAttribute('data-title') || 'Visual');
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // ----- Starfield canvas -----
  const canvas = document.getElementById('starfield');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  let stars = [];
  let width = 0;
  let height = 0;
  let animationId = null;
  let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initStars();
  }

  function initStars() {
    const count = Math.min(180, Math.floor((width * height) / 9000));
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * Math.PI * 2,
        sp: 0.008 + Math.random() * 0.02,
        warm: Math.random() > 0.85,
      });
    }
  }

  function drawStars(time) {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const twinkle = reduceMotion ? 1 : 0.55 + 0.45 * Math.sin(time * s.sp + s.tw);
      const alpha = s.a * twinkle;

      if (s.warm) {
        ctx.fillStyle = `rgba(251, 191, 36, ${alpha * 0.85})`;
      } else if (s.r > 1.1) {
        ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reduceMotion) {
      animationId = requestAnimationFrame(drawStars);
    }
  }

  resize();
  drawStars(0);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (animationId) cancelAnimationFrame(animationId);
      resize();
      drawStars(0);
    }, 120);
  });

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    reduceMotion = e.matches;
    if (animationId) cancelAnimationFrame(animationId);
    drawStars(0);
  });

  // Subtle parallax on decorative planets (desktop)
  const cosmicBg = document.querySelector('.cosmic-bg');
  if (cosmicBg && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    let raf = null;
    window.addEventListener(
      'mousemove',
      (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const cx = (e.clientX / width - 0.5) * 12;
          const cy = (e.clientY / height - 0.5) * 12;
          cosmicBg.style.transform = `translate(${cx}px, ${cy}px)`;
          raf = null;
        });
      },
      { passive: true }
    );
  }
})();
