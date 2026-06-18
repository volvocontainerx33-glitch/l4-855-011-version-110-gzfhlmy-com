(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var sliders = document.querySelectorAll('[data-hero-slider]');

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));

    if (!slides.length) {
      return;
    }

    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  });

  var searchInputs = document.querySelectorAll('[data-local-search]');

  function runFilter(input) {
    var scope = input.closest('main') || document;
    var query = input.value.trim().toLowerCase();
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = scope.querySelector('[data-empty-state]');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-tags') || ''
      ].join(' ').toLowerCase();
      var matched = !query || haystack.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      runFilter(input);
    });

    var scope = input.closest('section') || input.closest('main') || document;
    var clear = scope.querySelector('[data-clear-search]');

    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        runFilter(input);
        input.focus();
      });
    }
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');

  if (q && searchInputs.length) {
    searchInputs.forEach(function (input) {
      input.value = q;
      runFilter(input);
    });
  }
})();

function initDetailPlayer(playUrl) {
  var box = document.querySelector('[data-player-box]');

  if (!box) {
    return;
  }

  var video = box.querySelector('video');
  var layer = box.querySelector('[data-play-layer]');
  var hlsInstance = null;
  var started = false;

  function loadAndPlay() {
    if (!video) {
      return;
    }

    if (!started) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(playUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playUrl;
      }
      started = true;
    }

    if (layer) {
      layer.classList.add('is-hidden');
    }

    video.controls = true;
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (layer) {
    layer.addEventListener('click', loadAndPlay);
  }

  video.addEventListener('click', function () {
    if (!started) {
      loadAndPlay();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
