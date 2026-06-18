(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setHero(index) {
    var slides = qsa(".hero-slide");
    var dots = qsa(".hero-dot");
    if (!slides.length) {
      return;
    }
    var next = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === next);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === next);
    });
    document.documentElement.dataset.heroIndex = String(next);
  }

  function initHero() {
    var slides = qsa(".hero-slide");
    if (!slides.length) {
      return;
    }
    document.documentElement.dataset.heroIndex = "0";
    qsa("[data-hero-next]").forEach(function (button) {
      button.addEventListener("click", function () {
        var current = Number(document.documentElement.dataset.heroIndex || "0");
        setHero(current + 1);
      });
    });
    qsa("[data-hero-prev]").forEach(function (button) {
      button.addEventListener("click", function () {
        var current = Number(document.documentElement.dataset.heroIndex || "0");
        setHero(current - 1);
      });
    });
    qsa(".hero-dot").forEach(function (button) {
      button.addEventListener("click", function () {
        setHero(Number(button.dataset.heroDot || "0"));
      });
    });
    window.setInterval(function () {
      var current = Number(document.documentElement.dataset.heroIndex || "0");
      setHero(current + 1);
    }, 5200);
  }

  function initRails() {
    qsa("[data-rail]").forEach(function (rail) {
      var section = rail.closest(".section");
      if (!section) {
        return;
      }
      qsa("[data-scroll]", section).forEach(function (button) {
        button.addEventListener("click", function () {
          var delta = button.dataset.scroll === "left" ? -420 : 420;
          rail.scrollBy({ left: delta, behavior: "smooth" });
        });
      });
    });
  }

  function initMobileNav() {
    var button = qs(".nav-toggle");
    var inner = qs(".header-inner");
    if (!button || !inner) {
      return;
    }
    button.addEventListener("click", function () {
      var open = inner.classList.toggle("nav-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function resultImage(item) {
    var prefix = document.body.dataset.depth === "deep" ? "../" : "./";
    return prefix + item.cover + ".jpg";
  }

  function resultUrl(item) {
    var prefix = document.body.dataset.depth === "deep" ? "../" : "./";
    return prefix + "movies/" + item.file;
  }

  function openSearchPanel(items) {
    var panel = qs(".search-panel");
    var box = qs(".search-results");
    if (!panel || !box) {
      return;
    }
    if (!items.length) {
      box.innerHTML = '<div class="content-panel"><p>没有找到匹配内容。</p></div>';
    } else {
      box.innerHTML = items.slice(0, 18).map(function (item) {
        return '<a class="search-result" href="' + resultUrl(item) + '">' +
          '<img src="' + resultImage(item) + '" alt="' + escapeHtml(item.title) + '">' +
          '<span><strong>' + escapeHtml(item.title) + '</strong><span>' +
          escapeHtml(item.region + " · " + item.year + " · " + item.genre) +
          '</span></span></a>';
      }).join("");
    }
    panel.hidden = false;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function searchItems(query) {
    var q = query.trim().toLowerCase();
    if (!q || !window.SEARCH_ITEMS) {
      return [];
    }
    return window.SEARCH_ITEMS.filter(function (item) {
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.genre,
        item.category,
        item.tags
      ].join(" ").toLowerCase();
      return haystack.indexOf(q) !== -1;
    });
  }

  function initSearch() {
    qsa(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        openSearchPanel(searchItems(input ? input.value : ""));
      });
    });
    var close = qs(".search-close");
    var panel = qs(".search-panel");
    if (close && panel) {
      close.addEventListener("click", function () {
        panel.hidden = true;
      });
      panel.addEventListener("click", function (event) {
        if (event.target === panel) {
          panel.hidden = true;
        }
      });
    }
  }

  function initCatalogFilters() {
    var input = qs("[data-catalog-search]");
    var select = qs("[data-catalog-year]");
    var cards = qsa("[data-title][data-year]");
    if (!cards.length) {
      return;
    }

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var year = select ? select.value : "";
      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre
        ].join(" ").toLowerCase();
        var matchText = !q || text.indexOf(q) !== -1;
        var matchYear = !year || card.dataset.year === year;
        card.classList.toggle("is-hidden", !(matchText && matchYear));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
  }

  function initPlayers() {
    qsa(".watch-player").forEach(function (player) {
      var video = qs("video", player);
      var button = qs(".play-layer", player);
      if (!video || !button) {
        return;
      }

      function attach() {
        if (player.dataset.ready === "1") {
          return Promise.resolve();
        }
        var src = player.dataset.stream;
        player.dataset.ready = "1";
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            window.setTimeout(resolve, 1400);
          });
        }
        video.src = src;
        return Promise.resolve();
      }

      function play() {
        attach().then(function () {
          button.hidden = true;
          video.controls = true;
          var action = video.play();
          if (action && typeof action.catch === "function") {
            action.catch(function () {
              button.hidden = false;
            });
          }
        });
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHero();
    initRails();
    initMobileNav();
    initSearch();
    initCatalogFilters();
    initPlayers();
  });
})();
