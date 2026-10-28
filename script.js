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

  // Gallery lightbox
  document.querySelectorAll('.gallery-item img').forEach(function (im) {
    im.addEventListener('click', function () {
      var box = document.createElement('div');
      box.className = 'lightbox';
      var big = document.createElement('img');
      big.src = im.getAttribute('data-full') || im.src;
      big.alt = im.alt;
      box.appendChild(big);
      function close() { box.remove(); document.removeEventListener('keydown', onKey); }
      function onKey(e) { if (e.key === 'Escape') close(); }
      box.addEventListener('click', close);
      document.addEventListener('keydown', onKey);
      document.body.appendChild(box);
    });
  });

  // Basic form submit handling (demo only, no backend)
  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('Thanks! Your request has been received. Our team will contact you shortly.');
      form.reset();
    });
  });
});
