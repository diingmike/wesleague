// script for year
    document.getElementById('year').textContent = new Date().getFullYear();

// header interactions
// handles: search drawer toggle, mobile nav toggle, keyboard close
    (function () 
    {
        'use strict';

        const searchToggle = document.getElementById('searchToggle');
        const searchDrawer = document.getElementById('searchDrawer');
        const searchInput  = document.getElementById('searchInput');
        const menuToggle   = document.getElementById('menuToggle');
        const mobileNav    = document.getElementById('mobileNav');

        if (!searchToggle || !searchDrawer || !menuToggle || !mobileNav) return;

        let searchOpen = false;
        let menuOpen   = false;

        /* ---------- helpers ---------- */
        function openSearch() 
        {
            searchOpen = true;
            searchDrawer.classList.add('open');
            searchDrawer.setAttribute('aria-hidden', 'false');
            searchToggle.classList.add('active');
            searchToggle.setAttribute('aria-expanded', 'true');
            if (searchInput) {
                searchInput.setAttribute('tabindex', '0');
                setTimeout(() => searchInput.focus(), 300);
            }
        }

        function closeSearch() 
        {
            searchOpen = false;
            searchDrawer.classList.remove('open');
            searchDrawer.setAttribute('aria-hidden', 'true');
            searchToggle.classList.remove('active');
            searchToggle.setAttribute('aria-expanded', 'false');
            if (searchInput) searchInput.setAttribute('tabindex', '-1');
        }

        function openMenu() 
        {
            menuOpen = true;
            mobileNav.classList.add('open');
            mobileNav.setAttribute('aria-hidden', 'false');
            menuToggle.classList.add('open');
            menuToggle.setAttribute('aria-expanded', 'true');
        }

        function closeMenu() 
        {
            menuOpen = false;
            mobileNav.classList.remove('open');
            mobileNav.setAttribute('aria-hidden', 'true');
            menuToggle.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        }

        /* ---------- toggle events ---------- */
        searchToggle.addEventListener('click', () => 
        {
            if (menuOpen) closeMenu();
            searchOpen ? closeSearch() : openSearch();
        });

        menuToggle.addEventListener('click', () => 
        {
            if (searchOpen) closeSearch();
            menuOpen ? closeMenu() : openMenu();
        });

        /* ---------- close on Escape ---------- */
        document.addEventListener('keydown', (e) => 
        {
            if (e.key === 'Escape') 
            {
                closeSearch();
                closeMenu();
            }
        });

        /* ---------- close when clicking outside ---------- */
        document.addEventListener('click', (e) => 
        {
            const header = document.querySelector('.wl-header');
            if (!header) return;
            if (!header.contains(e.target) &&
                !searchDrawer.contains(e.target) &&
                !mobileNav.contains(e.target)) {
                closeSearch();
                closeMenu();
            }
        });

})();

// Wes League — Gallery Carousel
// 3 slides per page on desktop, 2 on tablet, 1 on mobile
// Prev / Next buttons + dot indicators
// Keyboard arrow support
// Touch swipe support
    (function () 
    {
        'use strict';

        const track   = document.getElementById('galleryTrack');
        const prevBtn = document.getElementById('galleryPrev');
        const nextBtn = document.getElementById('galleryNext');
        const dotsEl  = document.getElementById('galleryDots');
        const countEl = document.getElementById('galleryCount');

        if (!track || !prevBtn || !nextBtn) return;

        const slides = Array.from(track.querySelectorAll('.gallery-slide'));
        let current  = 0;
        const GAP    = 16; // must match CSS gap value

        /* ── How many slides are visible at once (mirrors CSS breakpoints) ── */
        function perPage() 
        {
            if (window.innerWidth <= 480) return 1;
            if (window.innerWidth <= 900) return 2;
            return 3;
        }

        function pageCount() 
        {
            return Math.ceil(slides.length / perPage());
        }

        /* ── Build dot buttons ── */
        function buildDots() 
        {
            dotsEl.innerHTML = '';
            const n = pageCount();
            for (let i = 0; i < n; i++) 
            {
                const dot = document.createElement('button');
                dot.className  = 'gallery-dot' + (i === current ? ' active' : '');
                dot.setAttribute('aria-label', `Page ${i + 1} of ${n}`);
                dot.addEventListener('click', () => goTo(i));
                dotsEl.appendChild(dot);
            }
        }

        /* ── Navigate to a page ── */
        function goTo(page) 
        {
            const n  = pageCount();
            current  = Math.max(0, Math.min(page, n - 1));

            const pp     = perPage();
            const outer  = track.parentElement;
            const trackW = outer.clientWidth;
            const slideW = (trackW - GAP * (pp - 1)) / pp;
            const offset = current * (slideW + GAP) * pp;

            track.style.transform = `translateX(-${offset}px)`;

            prevBtn.disabled = current === 0;
            nextBtn.disabled = current === n - 1;

            if (countEl) countEl.textContent = `${current + 1} / ${n}`;

            /* sync dots */
            Array.from(dotsEl.querySelectorAll('.gallery-dot')).forEach((d, i) => 
            {
                d.classList.toggle('active', i === current);
                d.setAttribute('aria-pressed', String(i === current));
            });
        }

        /* ── Button listeners ── */
        prevBtn.addEventListener('click', () => goTo(current - 1));
        nextBtn.addEventListener('click', () => goTo(current + 1));

        /* ── Keyboard ── */
        document.addEventListener('keydown', (e) => 
        {
            if (e.key === 'ArrowLeft')  goTo(current - 1);
            if (e.key === 'ArrowRight') goTo(current + 1);
        });

        /* ── Touch swipe ── */
        let touchStartX = 0;
        track.addEventListener('touchstart', (e) => 
        {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        track.addEventListener('touchend', (e) => 
        {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 40) 
            {
                dx < 0 ? goTo(current + 1) : goTo(current - 1);
            }
        });

        /* ── Recalculate on resize ── */
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                /* temporarily disable transition so it snaps, not slides */
                track.style.transition = 'none';
                buildDots();
                goTo(Math.min(current, pageCount() - 1));
                /* re-enable transition on next frame */
                requestAnimationFrame(() => {
                    track.style.transition = '';
                });
            }, 150);
        });

        /* ── Init ── */
        buildDots();
        goTo(0);

})();

//script for fixtures page
    (function () 
    {
        const pills     = Array.from(document.querySelectorAll('.matchday-pills .filter-btn'));
        const groups    = Array.from(document.querySelectorAll('.matchday-group'));
        const prevBtn   = document.getElementById('prevMatchday');
        const nextBtn   = document.getElementById('nextMatchday');
        let current     = 0; // index into pills array

        function goTo(idx) 
        {
            current = Math.max(0, Math.min(idx, pills.length - 1));

            pills.forEach((p, i) => p.classList.toggle('active', i === current));
            groups.forEach((g, i) => i === current ? g.removeAttribute('hidden') : g.setAttribute('hidden', ''));

            prevBtn.disabled = current === 0;
            nextBtn.disabled = current === pills.length - 1;
        }

        pills.forEach((btn, i) => btn.addEventListener('click', () => goTo(i)));
        prevBtn.addEventListener('click', () => goTo(current - 1));
        nextBtn.addEventListener('click', () => goTo(current + 1));

        goTo(0); // init
    })();

// script for contact page
    document.getElementById('contactForm').addEventListener('submit', function (e) 
    {
        e.preventDefault();
        // TODO: replace with real form submission (fetch POST or Formspree)
        const success = document.getElementById('formSuccess');
        success.classList.add('show');
        this.reset();
        setTimeout(() => success.classList.remove('show'), 5000);
    });

// script for search page
    (function () 
    {
        'use strict';

        const srInput     = document.getElementById('srInput');
        const srBtn       = document.getElementById('srBtn');
        const srQueryLine = document.getElementById('srQueryLine');
        const srGrid      = document.getElementById('srGrid');
        const srEmpty     = document.getElementById('srEmpty');

        // Filter tabs
        document.querySelectorAll('.sr-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.sr-tab').forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
            });
        });

        // Update query line on new search
        function runSearch() {
            const val = srInput.value.trim();
            if (!val) return;

            const cards = srGrid.querySelectorAll('.sr-card');
            srQueryLine.innerHTML = `Showing results for <strong>"${val}"</strong> — ${cards.length} result${cards.length !== 1 ? 's' : ''} found`;

            // Show empty state if no cards
            if (cards.length === 0) {
                srGrid.style.display = 'none';
                srEmpty.style.display = 'flex';
            } else {
                srGrid.style.display = 'grid';
                srEmpty.style.display = 'none';
            }

            // In a real implementation, submit to: search.html?q=VALUE
            // window.location.href = `search.html?q=${encodeURIComponent(val)}`;
        }

        srBtn.addEventListener('click', runSearch);
        srInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') runSearch();
        });

    })();