(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function initSearch() {
    var movies = window.SITE_MOVIES || [];
    var inputs = document.querySelectorAll(".site-search");
    inputs.forEach(function (input) {
      var wrap = input.parentElement;
      var results = wrap ? wrap.querySelector("[data-search-results]") : null;
      if (!results) {
        return;
      }
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        if (!query) {
          results.classList.remove("is-open");
          results.innerHTML = "";
          return;
        }
        var matched = movies.filter(function (movie) {
          return normalize(movie.title + " " + movie.year + " " + movie.type + " " + movie.region + " " + movie.genre).indexOf(query) !== -1;
        }).slice(0, 10);
        results.innerHTML = matched.map(function (movie) {
          return '<a href="./' + movie.url + '"><strong>' + escapeHtml(movie.title) + '</strong><small>' + escapeHtml(movie.region + ' · ' + movie.year + ' · ' + movie.type) + '</small></a>';
        }).join("");
        results.classList.toggle("is-open", matched.length > 0);
      });
      input.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          results.classList.remove("is-open");
          input.blur();
        }
      });
      document.addEventListener("click", function (event) {
        if (!wrap.contains(event.target)) {
          results.classList.remove("is-open");
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initCardTools() {
    var input = document.querySelector("[data-card-filter]");
    var select = document.querySelector("[data-sort-select]");
    var list = document.querySelector("[data-card-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    function filterCards() {
      var query = input ? normalize(input.value) : "";
      cards.forEach(function (card) {
        var haystack = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-year") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-genre"));
        card.style.display = haystack.indexOf(query) === -1 ? "none" : "";
      });
    }

    function sortCards() {
      var value = select ? select.value : "default";
      var sorted = cards.slice();
      if (value === "year-desc" || value === "year-asc") {
        sorted.sort(function (a, b) {
          var ay = Number(String(a.getAttribute("data-year") || "").match(/\d{4}/));
          var by = Number(String(b.getAttribute("data-year") || "").match(/\d{4}/));
          return value === "year-desc" ? by - ay : ay - by;
        });
      }
      if (value === "title-asc") {
        sorted.sort(function (a, b) {
          return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
        });
      }
      if (value === "default") {
        sorted = cards.slice();
      }
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
      filterCards();
    }

    if (input) {
      input.addEventListener("input", filterCards);
    }
    if (select) {
      select.addEventListener("change", sortCards);
    }
  }

  ready(function () {
    initMenu();
    initSearch();
    initHero();
    initCardTools();
  });
})();
