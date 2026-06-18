(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = selectAll('[data-hero-slide]', slider);
        var dots = selectAll('[data-hero-dot]', slider);
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards(options) {
        var cards = options.cards;
        var query = normalize(options.query);
        var region = normalize(options.region);
        var type = normalize(options.type);
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-category')
            ].join(' '));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardType = normalize(card.getAttribute('data-type'));
            var matched = true;

            if (query && text.indexOf(query) === -1) {
                matched = false;
            }

            if (region && cardRegion !== region) {
                matched = false;
            }

            if (type && cardType !== type) {
                matched = false;
            }

            card.classList.toggle('hidden-card', !matched);

            if (matched) {
                visible += 1;
            }
        });

        if (options.count) {
            options.count.textContent = '共 ' + visible + ' 部影片';
        }
    }

    var searchForm = document.querySelector('[data-search-form]');

    if (searchForm) {
        var searchInput = searchForm.querySelector('[data-search-input]');
        var regionFilter = searchForm.querySelector('[data-region-filter]');
        var typeFilter = searchForm.querySelector('[data-type-filter]');
        var searchCards = selectAll('[data-search-card]');
        var resultCount = document.querySelector('[data-result-count]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (searchInput) {
            searchInput.value = initialQuery;
        }

        function applySearch(event) {
            if (event) {
                event.preventDefault();
            }
            filterCards({
                cards: searchCards,
                query: searchInput ? searchInput.value : '',
                region: regionFilter ? regionFilter.value : '',
                type: typeFilter ? typeFilter.value : '',
                count: resultCount
            });
        }

        searchForm.addEventListener('submit', applySearch);
        [searchInput, regionFilter, typeFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applySearch);
                control.addEventListener('change', applySearch);
            }
        });
        applySearch();
    }

    var listFilter = document.querySelector('[data-list-filter]');

    if (listFilter) {
        var listInput = listFilter.querySelector('[data-list-input]');
        var listCards = selectAll('[data-search-card]');
        var listCount = listFilter.querySelector('[data-list-count]');

        function applyListFilter() {
            filterCards({
                cards: listCards,
                query: listInput ? listInput.value : '',
                count: listCount
            });
        }

        if (listInput) {
            listInput.addEventListener('input', applyListFilter);
        }
        applyListFilter();
    }
}());
