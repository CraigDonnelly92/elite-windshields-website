// Elite Windshields - shared behavior

// ---- Form settings ----
// Quote and contact forms are in TEST MODE while FORM_ENDPOINT is empty: they validate and show the
// thank-you message, but nothing is sent anywhere. To go live, paste the form service's URL below
// (for example a Formspree or Web3Forms endpoint) and add any extra fields it needs (such as an access key).
var FORM_ENDPOINT = 'https://api.web3forms.com/submit';
// TEST access key (messages go to the developer's test inbox). Replace with the client's own key at launch.
var FORM_EXTRA_FIELDS = { access_key: '4da97c62-ac6b-4101-b94b-a9ab5cb59c92', from_name: 'Elite Windshields Website' };


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

  // Pre-select the service on the quote form from a link like quote.html?service=Window+Tinting
  var svc = document.getElementById('q-service');
  if (svc && window.URLSearchParams) {
    var wanted = new URLSearchParams(location.search).get('service');
    if (wanted) {
      Array.prototype.forEach.call(svc.options, function (opt) {
        if (opt.text.toLowerCase() === wanted.toLowerCase()) svc.value = opt.value || opt.text;
      });
    }
  }

  // Quote + contact forms
  var AUTOCOMPLETE = {
    'q-first': 'given-name', 'q-last': 'family-name', 'q-email': 'email', 'q-phone': 'tel',
    'c-name': 'name', 'c-email': 'email', 'c-phone': 'tel'
  };

  function formData(form) {
    var data = {};
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (el.name === 'website' || el.type === 'submit' || el.type === 'button' || !el.id) return;
      var val = (el.value || '').trim();
      if (!val) return;
      var lab = form.querySelector('label[for="' + el.id + '"]');
      data[lab ? lab.textContent.trim() : el.id] = val;
    });
    var em = form.querySelector('input[type="email"]');
    if (em && em.value.trim()) data.email = em.value.trim();
    var fn = form.querySelector('#q-first'), ln = form.querySelector('#q-last'), fl = form.querySelector('#c-name');
    var nm = fl ? fl.value.trim() : ((fn ? fn.value.trim() : '') + ' ' + (ln ? ln.value.trim() : '')).trim();
    if (nm) data.name = nm;
    data.subject = 'New website request: ' + document.title.split('|')[0].trim();
    data._subject = data.subject;
    data.page = location.href;
    data.submitted = new Date().toISOString();
    for (var k in FORM_EXTRA_FIELDS) data[k] = FORM_EXTRA_FIELDS[k];
    return data;
  }

  function sendForm(data) {
    if (!FORM_ENDPOINT) {
      if (window.console) console.info('[Elite Windshields] Test mode - form not sent:', data);
      return new Promise(function (resolve) { setTimeout(function () { resolve(true); }, 700); });
    }
    return fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (j) {
        return res.ok && j.success !== false;
      });
    });
  }

  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    var loadedAt = Date.now();
    var btn = form.querySelector('button[type="submit"]');
    var label = btn.textContent;

    Object.keys(AUTOCOMPLETE).forEach(function (id) {
      var el = form.querySelector('#' + id);
      if (el) el.setAttribute('autocomplete', AUTOCOMPLETE[id]);
    });

    var hp = document.createElement('div');
    hp.className = 'hp-field';
    hp.setAttribute('aria-hidden', 'true');
    hp.innerHTML = '<label>Leave this field empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label>';
    form.appendChild(hp);

    var status = document.createElement('div');
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.insertBefore(status, btn);

    function showThanks(name) {
      var panel = document.createElement('div');
      panel.className = 'form-success';
      panel.setAttribute('role', 'status');
      panel.innerHTML =
        '<div class="check-big">&#10003;</div>' +
        '<h3>Thank you' + '</h3>' +
        '<p></p>' +
        (FORM_ENDPOINT ? '' : '<p class="test-note">Test mode: this submission was not sent.</p>') +
        '<button type="button" class="btn btn-outline">Send another</button>';
      panel.querySelector('p').textContent = (name ? name + ', your' : 'Your') +
        ' request has been received. Our team will contact you shortly. For anything urgent, call 780-835-1844.';
      panel.querySelector('button').addEventListener('click', function () {
        panel.remove();
        form.hidden = false;
        form.reset();
        loadedAt = Date.now();
      });
      form.hidden = true;
      form.parentNode.insertBefore(panel, form.nextSibling);
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (btn.disabled) return;
      status.textContent = '';
      status.className = 'form-status';
      var first = form.querySelector('input[type="text"]');
      var name = first && first.name !== 'website' ? first.value.trim().split(/\s+/)[0] : '';

      // Spam traps: hidden field filled in, or submitted impossibly fast. Pretend success, send nothing.
      if (hp.querySelector('input').value || Date.now() - loadedAt < 2000) { showThanks(name); return; }

      btn.disabled = true;
      btn.textContent = 'Sending...';
      sendForm(formData(form)).then(function (ok) {
        if (!ok) throw new Error('send failed');
        showThanks(name);
      }).catch(function () {
        status.className = 'form-status error';
        status.textContent = 'Sorry, something went wrong and your message was not sent. Please try again, or call us at 780-835-1844.';
      }).then(function () {
        btn.disabled = false;
        btn.textContent = label;
      });
    });
  });
});
