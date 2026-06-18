document.addEventListener("DOMContentLoaded", function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var siteNav = document.querySelector("[data-site-nav]");

    if (navToggle && siteNav) {
        navToggle.addEventListener("click", function () {
            siteNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5800);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    var filterRoot = document.querySelector("[data-filter-root]");

    if (filterRoot) {
        var input = filterRoot.querySelector("[data-filter-input]");
        var category = filterRoot.querySelector("[data-filter-category]");
        var type = filterRoot.querySelector("[data-filter-type]");
        var year = filterRoot.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));
        var empty = filterRoot.querySelector("[data-empty-state]");

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function applyFilter() {
            var query = normalize(input ? input.value : "");
            var selectedCategory = normalize(category ? category.value : "");
            var selectedType = normalize(type ? type.value : "");
            var selectedYear = normalize(year ? year.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year")
                ].join(" "));

                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchCategory = !selectedCategory || normalize(card.getAttribute("data-category")) === selectedCategory;
                var matchType = !selectedType || normalize(card.getAttribute("data-type")).indexOf(selectedType) !== -1;
                var matchYear = !selectedYear || normalize(card.getAttribute("data-year")) === selectedYear;
                var matched = matchQuery && matchCategory && matchType && matchYear;

                card.style.display = matched ? "" : "none";

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        [input, category, type, year].forEach(function (control) {
            if (!control) {
                return;
            }

            control.addEventListener("input", applyFilter);
            control.addEventListener("change", applyFilter);
        });

        applyFilter();
    }
});
