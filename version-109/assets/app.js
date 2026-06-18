(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-menu-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }

      function play() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          play();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          play();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          play();
        });
      });
      show(0);
      play();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var section = panel.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
      var search = panel.querySelector("[data-filter-search]");
      var selects = Array.prototype.slice.call(panel.querySelectorAll("select[data-filter-field]"));
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      function fillSelect(select) {
        var field = select.getAttribute("data-filter-field");
        var values = [];
        cards.forEach(function (card) {
          var value = card.getAttribute("data-" + field) || "";
          if (field === "genre") {
            value.split(/[，,、/]/).forEach(function (item) {
              item = item.trim();
              if (item && values.indexOf(item) === -1) {
                values.push(item);
              }
            });
          } else if (value && values.indexOf(value) === -1) {
            values.push(value);
          }
        });
        values.sort(function (a, b) {
          return String(b).localeCompare(String(a), "zh-CN");
        });
        values.forEach(function (value) {
          if (!Array.prototype.some.call(select.options, function (option) { return option.value === value; })) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
          }
        });
      }

      function matchSelect(card, select) {
        var field = select.getAttribute("data-filter-field");
        var selected = normalize(select.value);
        if (!selected) {
          return true;
        }
        return normalize(card.getAttribute("data-" + field)).indexOf(selected) !== -1;
      }

      function applyFilter() {
        var keyword = normalize(search ? search.value : "");
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year"),
            card.getAttribute("data-category")
          ].join(" "));
          var visible = !keyword || haystack.indexOf(keyword) !== -1;
          selects.forEach(function (select) {
            visible = visible && matchSelect(card, select);
          });
          card.classList.toggle("is-hidden-card", !visible);
        });
      }

      selects.forEach(fillSelect);
      if (search && initialQuery) {
        search.value = initialQuery;
      }
      if (search) {
        search.addEventListener("input", applyFilter);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", applyFilter);
      });
      applyFilter();
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var stream = player.getAttribute("data-stream");
      var initialized = false;
      var hls = null;

      function startPlayback() {
        if (!video || !stream) {
          return;
        }
        if (!initialized) {
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
          initialized = true;
        }
        if (button) {
          button.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          startPlayback();
        });
      }
      player.addEventListener("click", function (event) {
        if (event.target === video || event.target.closest("button")) {
          return;
        }
        startPlayback();
      });
      if (video) {
        video.addEventListener("play", function () {
          if (button) {
            button.classList.add("is-hidden");
          }
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0 && button) {
            button.classList.remove("is-hidden");
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
