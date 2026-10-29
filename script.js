// Elite Windshields - shared behavior

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function () {
  var hamburger = document.querySelector('.hamburger');
  var nav = document.querySelector('.main-nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      nav.classList.toggle('nav-open');
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
      });
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Gallery carousel + lightbox
  var grid = document.querySelector('.gallery-grid[data-carousel]');
  if (grid) {
    var slides = Array.prototype.map.call(grid.querySelectorAll('.gallery-item'), function (fig) {
      var im = fig.querySelector('img');
      var cap = fig.querySelector('figcaption');
      return { thumb: im.src, full: im.getAttribute('data-full') || im.src, alt: im.alt, caption: cap ? cap.textContent : im.alt };
    });
    var cur = 0, showToken = 0;
    var car = document.createElement('div');
    car.className = 'carousel';
    car.innerHTML =
      '<div class="carousel-stage">' +
      '<button type="button" class="carousel-btn prev" aria-label="Previous photo">&#10094;</button>' +
      '<img class="carousel-main active" alt="">' +
      '<img class="carousel-main" alt="" aria-hidden="true">' +
      '<button type="button" class="carousel-btn next" aria-label="Next photo">&#10095;</button>' +
      '</div>' +
      '<div class="carousel-info"><span class="carousel-caption"></span><span class="carousel-count"></span></div>' +
      '<div class="carousel-thumbs"></div>';
    grid.parentNode.replaceChild(car, grid);
    var layers = car.querySelectorAll('.carousel-main');
    var stage = car.querySelector('.carousel-stage');
    var front = 0;
    var main = { get src() { return layers[front].src; } };
    var capEl = car.querySelector('.carousel-caption');
    var countEl = car.querySelector('.carousel-count');
    var thumbs = car.querySelector('.carousel-thumbs');
    var thumbEls = slides.map(function (s, i) {
      var t = document.createElement('img');
      t.src = s.thumb; t.alt = s.alt; t.loading = 'lazy';
      t.addEventListener('click', function () { show(i); start(); });
      thumbs.appendChild(t);
      return t;
    });
    function show(i) {
      cur = (i + slides.length) % slides.length;
      var next = layers[1 - front];
      var url = slides[cur].full;
      var token = ++showToken;
      function swap() {
        if (token !== showToken) return;
        next.alt = slides[cur].alt;
        next.setAttribute('aria-hidden', 'false');
        layers[front].setAttribute('aria-hidden', 'true');
        layers[front].classList.remove('active');
        next.classList.add('active');
        front = 1 - front;
      }
      if (layers[front].getAttribute('src') !== url) {
        next.onload = swap; next.onerror = swap;
        next.src = url;
        if (next.complete && next.naturalWidth) swap();
      }
      capEl.textContent = slides[cur].caption;
      countEl.textContent = (cur + 1) + ' / ' + slides.length;
      thumbEls.forEach(function (t, k) { t.classList.toggle('active', k === cur); });
      var active = thumbEls[cur];
      thumbs.scrollTo({ left: active.offsetLeft - (thumbs.clientWidth - active.clientWidth) / 2, behavior: 'smooth' });
    }
    // Autoplay: advance every 5s; pause on hover/focus/lightbox/hidden tab; skip if reduced motion requested
    var timer = null, paused = false;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      stop();
      if (reduce || paused || document.hidden || document.querySelector('.lightbox')) return;
      timer = setInterval(function () { show(cur + 1); }, 5000);
    }
    car.addEventListener('mouseenter', function () { paused = true; stop(); });
    car.addEventListener('mouseleave', function () { paused = false; start(); });
    car.addEventListener('focusin', function () { paused = true; stop(); });
    car.addEventListener('focusout', function () { paused = false; start(); });
    document.addEventListener('visibilitychange', start);
    car.querySelector('.prev').addEventListener('click', function () { show(cur - 1); start(); });
    car.querySelector('.next').addEventListener('click', function () { show(cur + 1); start(); });
    var startX = null;
    stage.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { show(cur + (dx < 0 ? 1 : -1)); start(); }
      startX = null;
    });
    document.addEventListener('keydown', function (e) {
      if (document.querySelector('.lightbox')) return;
      if (e.key === 'ArrowLeft') { show(cur - 1); start(); }
      if (e.key === 'ArrowRight') { show(cur + 1); start(); }
    });
    stage.addEventListener('click', function (e) {
      if (e.target.closest('.carousel-btn')) return;
      var box = document.createElement('div');
      box.className = 'lightbox';
      var big = document.createElement('img');
      var prev = document.createElement('button');
      var next = document.createElement('button');
      prev.className = 'carousel-btn prev'; prev.innerHTML = '&#10094;'; prev.setAttribute('aria-label', 'Previous photo');
      next.className = 'carousel-btn next'; next.innerHTML = '&#10095;'; next.setAttribute('aria-label', 'Next photo');
      function sync() { big.src = slides[cur].full; big.alt = slides[cur].alt; show(cur); }
      function close() { box.remove(); document.removeEventListener('keydown', onKey); start(); }
      function onKey(e) {
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') { cur--; sync(); }
        if (e.key === 'ArrowRight') { cur++; sync(); }
      }
      prev.addEventListener('click', function (e) { e.stopPropagation(); cur--; sync(); });
      next.addEventListener('click', function (e) { e.stopPropagation(); cur++; sync(); });
      big.addEventListener('click', function (e) { e.stopPropagation(); });
      box.addEventListener('click', close);
      document.addEventListener('keydown', onKey);
      box.append(prev, big, next);
      stop();
      document.body.appendChild(box);
      sync();
    });
    show(0);
    start();
  }

  // Basic form submit handling (demo only, no backend)
  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('Thanks! Your request has been received. Our team will contact you shortly.');
      form.reset();
    });
  });
});
