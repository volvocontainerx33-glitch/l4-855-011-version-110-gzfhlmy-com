(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function toggleMobileMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      button.textContent = panel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initRails() {
    qsa('[data-scroll-left], [data-scroll-right]').forEach(function (button) {
      button.addEventListener('click', function () {
        var targetId = button.getAttribute('data-scroll-left') || button.getAttribute('data-scroll-right');
        var target = document.getElementById(targetId);
        if (!target) {
          return;
        }
        var direction = button.hasAttribute('data-scroll-left') ? -1 : 1;
        target.scrollBy({
          left: direction * 420,
          behavior: 'smooth'
        });
      });
    });
  }

  function initFilters() {
    var input = qs('[data-filter-input]');
    var yearSelect = qs('[data-filter-year]');
    var count = qs('[data-filter-count]');
    var cards = qsa('.searchable-card');

    if (!cards.length || (!input && !yearSelect)) {
      return;
    }

    function getHaystack(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var yearValue = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = getHaystack(card);
        var cardYear = card.getAttribute('data-year') || '';
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = true;

        if (yearValue === 'older') {
          var numericYear = Number((cardYear.match(/\d+/) || ['0'])[0]);
          matchesYear = numericYear > 0 && numericYear < 2020;
        } else if (yearValue) {
          matchesYear = cardYear.indexOf(yearValue) !== -1;
        }

        var shouldShow = matchesKeyword && matchesYear;
        card.classList.toggle('is-hidden-by-filter', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '共 ' + visible + ' 部影片';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
  }

  function initSearchPage() {
    var data = window.SEARCH_MOVIES || [];
    var results = document.getElementById('search-results');
    var input = document.getElementById('search-page-input');
    var status = document.getElementById('search-status');

    if (!results || !input || !data.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function render(list) {
      results.innerHTML = list.map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
          '    <div class="poster-frame">',
          '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '      <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
          '      <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
          '      <span class="play-hover">▶</span>',
          '    </div>',
          '    <h3>' + escapeHtml(movie.title) + '</h3>',
          '    <p>' + escapeHtml(movie.oneLine) + '</p>',
          '    <div class="card-meta">',
          '      <span>' + escapeHtml(movie.category) + '</span>',
          '      <span>' + escapeHtml(movie.region) + '</span>',
          '    </div>',
          '  </a>',
          '</article>'
        ].join('');
      }).join('');
    }

    function runSearch(value) {
      var normalized = value.trim().toLowerCase();
      if (!normalized) {
        status.textContent = '输入关键词，快速查找片名、地区、类型与标签。';
        render(data.slice(0, 24));
        return;
      }

      var terms = normalized.split(/\s+/).filter(Boolean);
      var matches = data.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.year,
          movie.type,
          movie.genre,
          movie.category,
          movie.tags,
          movie.oneLine
        ].join(' ').toLowerCase();
        return terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
      });

      status.textContent = '关键词：“' + value + '”，找到 ' + matches.length + ' 部影片';
      render(matches.slice(0, 200));
    }

    input.addEventListener('input', function () {
      runSearch(input.value);
    });

    runSearch(query);
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var source = player.getAttribute('data-source');
      var loading = qs('[data-player-loading]', player);
      var errorBox = qs('[data-player-error]', player);
      var muteButton = qs('[data-player-mute]', player);
      var fullscreenButton = qs('[data-player-fullscreen]', player);
      var toggleButtons = qsa('[data-player-toggle]', player);
      var hls = null;
      var prepared = false;

      if (!video || !source) {
        return;
      }

      function setLoading(visible) {
        if (loading) {
          loading.classList.toggle('is-visible', visible);
        }
      }

      function showError(message) {
        if (errorBox) {
          errorBox.textContent = message;
          errorBox.classList.add('is-visible');
        }
        setLoading(false);
      }

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        setLoading(true);

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setLoading(false);
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showError('视频加载失败，请稍后重试。');
              if (hls) {
                hls.destroy();
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setLoading(false);
          }, { once: true });
        } else {
          showError('当前浏览器暂不支持 HLS 播放。');
        }
      }

      function updateState() {
        var playing = !video.paused && !video.ended;
        player.classList.toggle('is-playing', playing);
        player.classList.toggle('is-paused', !playing);
        toggleButtons.forEach(function (button) {
          if (button.className === 'player-overlay') {
            return;
          }
          button.textContent = playing ? '暂停' : '▶';
        });
      }

      function togglePlay() {
        prepare();
        if (video.paused || video.ended) {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              player.classList.add('is-paused');
            });
          }
        } else {
          video.pause();
        }
        updateState();
      }

      toggleButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          togglePlay();
        });
      });

      video.addEventListener('click', togglePlay);
      video.addEventListener('play', updateState);
      video.addEventListener('pause', updateState);
      video.addEventListener('ended', updateState);
      video.addEventListener('waiting', function () {
        setLoading(true);
      });
      video.addEventListener('playing', function () {
        setLoading(false);
      });

      if (muteButton) {
        muteButton.addEventListener('click', function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? '静音' : '声音';
        });
      }

      if (fullscreenButton) {
        fullscreenButton.addEventListener('click', function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }

      player.classList.add('is-paused');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMobileMenu();
    initHero();
    initRails();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
