(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = all('.hero-slide', hero);
    var dots = all('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;
    var show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };
    var next = function () {
      show(current + 1);
    };
    var reset = function () {
      window.clearInterval(timer);
      timer = window.setInterval(next, 6500);
    };
    var prevButton = hero.querySelector('[data-hero-prev]');
    var nextButton = hero.querySelector('[data-hero-next]');
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        reset();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        next();
        reset();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        reset();
      });
    });
    reset();
  }

  function setupFiltering() {
    var input = document.querySelector('[data-filter-input]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var category = document.querySelector('[data-filter-category]');
    var cards = all('.movie-card[data-search], .rank-row[data-search]');
    if (!input || !cards.length) {
      return;
    }
    var apply = function () {
      var q = input.value.trim().toLowerCase();
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var categoryValue = category ? category.value : '';
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (regionValue && (card.getAttribute('data-region') || '').indexOf(regionValue) === -1) {
          ok = false;
        }
        if (typeValue && (card.getAttribute('data-type') || '').indexOf(typeValue) === -1) {
          ok = false;
        }
        if (categoryValue && (card.getAttribute('data-category') || '') !== categoryValue) {
          ok = false;
        }
        card.hidden = !ok;
      });
    };
    [input, region, type, category].forEach(function (item) {
      if (item) {
        item.addEventListener(item.tagName === 'INPUT' ? 'input' : 'change', apply);
      }
    });
  }

  function cardTemplate(movie) {
    var safe = function (value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    };
    return '<a class="movie-card" href="' + safe(movie.url) + '">' +
      '<span class="poster-box">' +
      '<img src="' + safe(movie.cover) + '" alt="' + safe(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="year-badge">' + safe(movie.year) + '</span>' +
      '<span class="score-badge">' + safe(movie.score) + '</span>' +
      '</span>' +
      '<span class="card-body">' +
      '<strong>' + safe(movie.title) + '</strong>' +
      '<span class="card-line">' + safe(movie.line) + '</span>' +
      '<span class="card-meta">' + safe(movie.region) + ' · ' + safe(movie.type) + ' · ' + safe(movie.category) + '</span>' +
      '</span>' +
      '</a>';
  }

  function setupSearchPage() {
    var results = document.getElementById('search-results');
    var input = document.getElementById('search-page-input');
    var empty = document.getElementById('search-empty');
    if (!results || !input || !window.searchMovies) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;
    var render = function () {
      var q = input.value.trim().toLowerCase();
      var list = window.searchMovies;
      if (q) {
        list = list.filter(function (movie) {
          return movie.search.indexOf(q) !== -1;
        });
      } else {
        list = list.slice(0, 60);
      }
      results.innerHTML = list.slice(0, 180).map(cardTemplate).join('');
      if (empty) {
        empty.hidden = list.length > 0;
      }
    };
    input.addEventListener('input', render);
    render();
  }

  setupFiltering();
  setupSearchPage();
})();
