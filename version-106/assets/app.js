(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupMenu() {
    all('[data-menu-button]').forEach(function (button) {
      var menu = one('[data-mobile-menu]');
      if (!menu) return;
      button.addEventListener('click', function () {
        menu.hidden = !menu.hidden;
      });
      all('.mobile-link', menu).forEach(function (link) {
        link.addEventListener('click', function () {
          menu.hidden = true;
        });
      });
    });
  }

  function setupHero() {
    var hero = one('[data-hero]');
    if (!hero) return;
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var prev = one('[data-hero-prev]', hero);
    var next = one('[data-hero-next]', hero);
    if (!slides.length) return;
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function advance(step) {
      show(current + step);
    }

    if (prev) prev.addEventListener('click', function () { advance(-1); });
    if (next) next.addEventListener('click', function () { advance(1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); });
    });
    timer = window.setInterval(function () { advance(1); }, 5200);
    hero.addEventListener('mouseenter', function () { window.clearInterval(timer); });
    hero.addEventListener('mouseleave', function () {
      timer = window.setInterval(function () { advance(1); }, 5200);
    });
  }

  function setupFilters() {
    all('[data-filter-form]').forEach(function (form) {
      var keyword = one('[data-filter-keyword]', form);
      var year = one('[data-filter-year]', form);
      var type = one('[data-filter-type]', form);
      var scope = form.parentElement || document;
      var cards = all('[data-movie-card]', scope);
      var empty = one('[data-no-results]', scope);

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function apply() {
        var q = normalize(keyword && keyword.value);
        var y = normalize(year && year.value);
        var t = normalize(type && type.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year')
          ].join(' '));
          var ok = (!q || text.indexOf(q) !== -1) &&
            (!y || normalize(card.getAttribute('data-year')) === y) &&
            (!t || normalize(card.getAttribute('data-type')) === t);
          card.hidden = !ok;
          if (ok) visible += 1;
        });
        if (empty) empty.classList.toggle('is-visible', visible === 0);
      }

      [keyword, year, type].forEach(function (control) {
        if (!control) return;
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      });
    });
  }

  window.initMoviePlayer = function (settings) {
    var video = document.getElementById(settings.videoId);
    var overlay = document.getElementById(settings.overlayId);
    var button = document.getElementById(settings.buttonId);
    var src = settings.src;
    var ready = false;

    function attach() {
      if (ready) return;
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = src;
      }
    }

    function play() {
      attach();
      if (overlay) overlay.hidden = true;
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          if (overlay) overlay.hidden = false;
        });
      }
    }

    if (!video) return;
    if (overlay) overlay.addEventListener('click', play);
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) play();
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
