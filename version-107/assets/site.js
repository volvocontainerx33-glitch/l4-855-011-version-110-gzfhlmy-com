(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  var searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot) {
    var keywordInput = searchRoot.querySelector('[data-filter-keyword]');
    var regionInput = searchRoot.querySelector('[data-filter-region]');
    var typeInput = searchRoot.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(searchRoot.querySelectorAll('[data-title]'));
    var empty = searchRoot.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (keywordInput && initial) {
      keywordInput.value = initial;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var region = normalize(regionInput && regionInput.value);
      var type = normalize(typeInput && typeInput.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' '));
        var regionText = normalize(card.getAttribute('data-region'));
        var genreText = normalize(card.getAttribute('data-genre'));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchRegion = !region || regionText.indexOf(region) !== -1;
        var matchType = !type || genreText.indexOf(type) !== -1;
        var showCard = matchKeyword && matchRegion && matchType;
        card.style.display = showCard ? '' : 'none';
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    }

    [keywordInput, regionInput, typeInput].forEach(function (field) {
      if (field) {
        field.addEventListener('input', applyFilters);
        field.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var overlay = document.querySelector('[data-player-overlay]');
  var errorBox = document.querySelector('[data-player-error]');
  var hlsInstance = null;

  function showError(message) {
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.classList.add('visible');
    }
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  function attachSource() {
    if (!video || !streamUrl) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showError('视频加载失败，请稍后重试');
        }
      });
      return;
    }

    showError('当前环境暂不支持播放');
  }

  function startPlayback() {
    if (!video) {
      return;
    }
    hideOverlay();
    var playAction = video.play();
    if (playAction && typeof playAction.catch === 'function') {
      playAction.catch(function () {
        showError('视频加载失败，请稍后重试');
      });
    }
  }

  attachSource();

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('play', hideOverlay);
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
