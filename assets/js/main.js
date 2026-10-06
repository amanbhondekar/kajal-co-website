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

  /* ---------- nav dropdowns ----------
     CSS handles hover and focus-within. This adds click/keyboard toggling so
     the menus also work on touch, where :hover never resolves.              */
  var dropItems = Array.prototype.slice.call(document.querySelectorAll('.nav__item'));
  if (dropItems.length) {
    var closeDrops = function (except) {
      dropItems.forEach(function (it) {
        if (it === except) return;
        it.classList.remove('is-open');
        var t = it.querySelector('.nav__link--drop');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    };
    dropItems.forEach(function (item) {
      var trigger = item.querySelector('.nav__link--drop');
      if (!trigger) return;
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var open = !item.classList.contains('is-open');
        closeDrops(item);
        item.classList.toggle('is-open', open);
        trigger.setAttribute('aria-expanded', String(open));
      });
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav__item')) closeDrops(null);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrops(null);
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
    var applyFilter = function (f) {
      Array.prototype.forEach.call(filterBar.querySelectorAll('button'), function (b) {
        b.classList.toggle('is-active', b.dataset.filter === f);
      });
      items.forEach(function (it) {
        it.classList.toggle('is-hidden', f !== 'all' && it.dataset.service !== f);
      });
    };

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-filter]');
      if (btn) applyFilter(btn.dataset.filter);
    });

    // deep links from the "Our Works" nav dropdown, e.g. portfolio.html#seo
    var fromHash = function () {
      var h = (location.hash || '').replace('#', '');
      if (h && filterBar.querySelector('button[data-filter="' + h + '"]')) applyFilter(h);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
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

  /* ---------- phone country flag ----------
     Inline SVG rather than emoji: Windows ships no flag glyphs, so
     regional-indicator pairs fall back to bare letter boxes there.        */
  var FLAGS = {
    '+91': '<rect width="24" height="16" fill="#fff"/><rect width="24" height="5.34" fill="#F93"/><rect y="10.66" width="24" height="5.34" fill="#138808"/><circle cx="12" cy="8" r="2.1" fill="none" stroke="#008" stroke-width=".7"/>',
    '+1':  '<rect width="24" height="16" fill="#fff"/><g fill="#B22234"><rect width="24" height="1.23"/><rect y="2.46" width="24" height="1.23"/><rect y="4.92" width="24" height="1.23"/><rect y="7.38" width="24" height="1.23"/><rect y="9.85" width="24" height="1.23"/><rect y="12.31" width="24" height="1.23"/><rect y="14.77" width="24" height="1.23"/></g><rect width="10" height="8.61" fill="#3C3B6E"/>',
    '+44': '<rect width="24" height="16" fill="#012169"/><path d="M0 0 24 16M24 0 0 16" stroke="#fff" stroke-width="3.2"/><path d="M0 0 24 16M24 0 0 16" stroke="#C8102E" stroke-width="1.9"/><path d="M12 0v16M0 8h24" stroke="#fff" stroke-width="5.3"/><path d="M12 0v16M0 8h24" stroke="#C8102E" stroke-width="3.2"/>',
    '+61': '<rect width="24" height="16" fill="#012169"/><g transform="scale(.5)"><path d="M0 0 24 16M24 0 0 16" stroke="#fff" stroke-width="3.2"/><path d="M0 0 24 16M24 0 0 16" stroke="#C8102E" stroke-width="1.9"/><path d="M12 0v16M0 8h24" stroke="#fff" stroke-width="5.3"/><path d="M12 0v16M0 8h24" stroke="#C8102E" stroke-width="3.2"/></g><g fill="#fff"><circle cx="6" cy="12.4" r=".9"/><circle cx="17.2" cy="3.2" r=".7"/><circle cx="20.2" cy="6.4" r=".7"/><circle cx="17.6" cy="9.8" r=".7"/><circle cx="14.6" cy="7" r=".6"/><circle cx="18.2" cy="6.4" r=".4"/></g>',
    '+65': '<rect width="24" height="16" fill="#fff"/><rect width="24" height="8" fill="#EF3340"/><circle cx="6" cy="4" r="2.6" fill="#fff"/><circle cx="7.7" cy="4" r="2.6" fill="#EF3340"/><g fill="#fff"><circle cx="8.5" cy="2.3" r=".5"/><circle cx="10" cy="3.4" r=".5"/><circle cx="9.4" cy="5.2" r=".5"/><circle cx="7.6" cy="5.2" r=".5"/><circle cx="7" cy="3.4" r=".5"/></g>',
    '+971':'<rect width="24" height="5.34" fill="#00732F"/><rect y="5.34" width="24" height="5.33" fill="#fff"/><rect y="10.66" width="24" height="5.34" fill="#000"/><rect width="6" height="16" fill="#F00"/>',
    '+49': '<rect width="24" height="5.34" fill="#000"/><rect y="5.34" width="24" height="5.33" fill="#D00"/><rect y="10.66" width="24" height="5.34" fill="#FFCE00"/>',
    '+33': '<rect width="8" height="16" fill="#002395"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#ED2939"/>'
  };

  document.querySelectorAll('[data-phone]').forEach(function (wrap) {
    var sel = wrap.querySelector('select');
    var flag = wrap.querySelector('[data-flag]');
    if (!sel || !flag) return;
    var paint = function () {
      var art = FLAGS[sel.value];
      flag.innerHTML = art
        ? '<svg viewBox="0 0 24 16" preserveAspectRatio="none" aria-hidden="true">' + art + '</svg>'
        : '';
    };
    paint();
    sel.addEventListener('change', paint);
  });

  /* ---------- "pick at least one service" ----------
     Native validation has no group-required, so mirror `required` across the
     set and clear it as soon as one is ticked.                             */
  document.querySelectorAll('[data-check-group]').forEach(function (group) {
    var boxes = Array.prototype.slice.call(group.querySelectorAll('input[type="checkbox"]'));
    if (!boxes.length) return;
    var sync = function () {
      var any = boxes.some(function (b) { return b.checked; });
      boxes.forEach(function (b) { b.required = !any; });
    };
    sync();
    boxes.forEach(function (b) { b.addEventListener('change', sync); });
  });

  /* ---------- year stamp ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
