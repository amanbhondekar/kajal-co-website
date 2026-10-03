/* Kajal & Co. — interaction layer */
(function () {
  'use strict';

  /* ---------- mobile sheet ---------- */
  var burger = document.querySelector('[data-nav-toggle]');
  var sheet = document.getElementById('sheet');
  if (burger && sheet) {
    burger.addEventListener('click', function () {
      var open = sheet.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    sheet.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        sheet.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheet.classList.contains('is-open')) burger.click();
    });
  }

  /* ---------- sticky header shrink ---------- */
  var header = document.querySelector('.header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- marquee: duplicate track content for a seamless loop ---------- */
  document.querySelectorAll('.marquee__track, .collage__col').forEach(function (track) {
    if (track.dataset.looped) return;
    track.dataset.looped = '1';
    track.innerHTML += track.innerHTML;
  });

  /* ---------- work rail: dot pagination ---------- */
  document.querySelectorAll('[data-rail]').forEach(function (rail) {
    var dots = document.querySelector('[data-rail-dots="' + rail.dataset.rail + '"]');
    if (!dots) return;
    var cards = Array.prototype.slice.call(rail.children);

    cards.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      if (i === 0) b.classList.add('is-active');
      b.addEventListener('click', function () {
        rail.scrollTo({ left: cards[i].offsetLeft - rail.offsetLeft, behavior: 'smooth' });
      });
      dots.appendChild(b);
    });

    var sync = function () {
      var mid = rail.scrollLeft + rail.clientWidth / 2;
      var best = 0, bestD = Infinity;
      cards.forEach(function (c, i) {
        var d = Math.abs((c.offsetLeft - rail.offsetLeft) + c.offsetWidth / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      Array.prototype.forEach.call(dots.children, function (b, i) {
        b.classList.toggle('is-active', i === best);
      });
    };
    rail.addEventListener('scroll', function () {
      window.clearTimeout(rail._t);
      rail._t = window.setTimeout(sync, 60);
    }, { passive: true });
  });

  /* ---------- portfolio filters ---------- */
  var filterBar = document.querySelector('[data-filters]');
  if (filterBar) {
    var items = document.querySelectorAll('[data-service]');
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      Array.prototype.forEach.call(filterBar.querySelectorAll('button'), function (b) {
        b.classList.toggle('is-active', b === btn);
      });
      var f = btn.dataset.filter;
      items.forEach(function (it) {
        it.classList.toggle('is-hidden', f !== 'all' && it.dataset.service !== f);
      });
    });
  }

  /* ---------- accordion: one open at a time, per group ---------- */
  document.querySelectorAll('[data-acc]').forEach(function (group) {
    var all = group.querySelectorAll('details');
    all.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        all.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });

  /* ---------- year stamp ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
