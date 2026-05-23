document.addEventListener('DOMContentLoaded', () => {

    // ─── CONSTANTS ────────────────────────────────────────────────
    // To adjust slide transition speed, change SLIDE_DURATION (ms).
    // The CSS transition values (opacity, transform, filter) also need to match.
    const SLIDE_DURATION = 6000; // 6 seconds per slide
    const TOTAL_SLIDES = 7;      // Number of slides (slide1 → slide7)
    const MAPS_SLIDE_INDEX = 4;  // 0-based index of slide 5

    // ─── ELEMENTS ─────────────────────────────────────────────────
    const starsContainerEl = document.getElementById('stars-container');
    const openBtn = document.getElementById('openBtn');
    const heartIcon = document.getElementById('heartIcon');
    const heartWrapper = document.getElementById('heartWrapper');
    const sliderContainer = document.getElementById('sliderContainer');
    const bgAudio = document.getElementById('bg-audio');
    const openingScreen = document.getElementById('openingScreen');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const mapsBtn = document.getElementById('mapsBtn');
    const musicBtn = document.getElementById('musicBtn');
    const musicIconOn = document.getElementById('musicIconOn');
    const musicIconOff = document.getElementById('musicIconOff');
    const creativeBtn = document.getElementById('creativeBtn');

    // ─── STARS ────────────────────────────────────────────────────
    const starCount = 150;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
        star.style.animationDelay = `${Math.random() * 5}s`;
        starsContainerEl.appendChild(star);
    }

    // ─── SLIDE TRANSITION ─────────────────────────────────────────
    // SLIDE_MOVE_MS  = duration of left/right slide movement
    // SLIDE_FADE_MS  = duration of content fade-in AFTER slide lands
    const SLIDE_MOVE_MS = 900;   // ← adjust to speed up/slow down slide movement
    const SLIDE_FADE_MS = 700;   // ← adjust to speed up/slow down fade-in
    let isAnimating = false;
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    let isPlaying = true; // audio state

    function updateNavButtons() {
        // Only handles prev/next arrow visibility
        if (currentSlide === 0) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }

        if (currentSlide === TOTAL_SLIDES - 1) {
            nextBtn.classList.add('hidden');
        } else {
            nextBtn.classList.remove('hidden');
        }
    }

    // ── Hide special buttons instantly (when leaving their slide) ──
    function hideSpecialButtons() {
        // maps-btn: instant hide via inline style (overrides CSS class)
        mapsBtn.style.transition = 'none';
        mapsBtn.style.opacity = '0';
        mapsBtn.style.pointerEvents = 'none';

        // creative-btn: back to display:none instantly
        creativeBtn.style.transition = 'none';
        creativeBtn.style.opacity = '0';
        creativeBtn.style.display = 'none';
    }

    // ── Show special button for a given slide, synchronized with Phase 2 ──
    function showSpecialButtonForSlide(index) {
        const fadeTransition = `opacity ${SLIDE_FADE_MS}ms ease-in-out`;

        if (index === MAPS_SLIDE_INDEX) {
            // Inline styles throughout — CSS class opacity is overridden by inline,
            // so we must set style.opacity='1' directly to trigger the transition.
            mapsBtn.style.transition = 'none';
            mapsBtn.style.opacity = '0';
            mapsBtn.style.pointerEvents = 'none';
            mapsBtn.getBoundingClientRect(); // force reflow
            mapsBtn.style.transition = fadeTransition;
            mapsBtn.style.opacity = '1';         // ← key fix: inline wins over class
            mapsBtn.style.pointerEvents = 'auto';
            mapsBtn.classList.add('show');        // keeps transform:translateY(0) from CSS
        }

        if (index === TOTAL_SLIDES - 1) {
            // creative uses display:none — prep it, then fade in
            creativeBtn.style.transition = 'none';
            creativeBtn.style.display = 'inline-flex';
            creativeBtn.style.opacity = '0';
            creativeBtn.getBoundingClientRect(); // force reflow
            creativeBtn.style.transition = fadeTransition;
            creativeBtn.style.opacity = '1';
        }
    }

    function goToSlide(index, direction) {
        if (index === currentSlide || isAnimating) return;
        isAnimating = true;

        const outgoing = slides[currentSlide];
        const incoming = slides[index];

        const inStart = direction === 'next' ? '100%' : '-100%';
        const outEnd = direction === 'next' ? '-25%' : '25%';

        // ── Hide special buttons immediately when leaving their slide ──
        hideSpecialButtons();

        // ── PHASE 1 SETUP: snap incoming off-screen, content invisible ──
        incoming.style.transition = 'none';
        incoming.style.transform = `translateX(${inStart})`;
        incoming.style.opacity = '0';
        incoming.getBoundingClientRect(); // force reflow

        // ── PHASE 1: slide movement ───────────────────────────────────
        const moveEase = `cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        incoming.style.transition = `transform ${SLIDE_MOVE_MS}ms ${moveEase}`;
        outgoing.style.transition = `transform ${SLIDE_MOVE_MS}ms ${moveEase}, opacity ${Math.round(SLIDE_MOVE_MS * 0.55)}ms ease`;

        incoming.style.transform = 'translateX(0)';
        incoming.classList.add('active');
        outgoing.style.transform = `translateX(${outEnd})`;
        outgoing.style.opacity = '0';

        // ── PHASE 2: fade-in content + special buttons simultaneously ──
        setTimeout(() => {
            incoming.style.transition = `opacity ${SLIDE_FADE_MS}ms ease-in-out`;
            incoming.style.opacity = '1';

            // Fade in the special button for this slide (same timing as content)
            showSpecialButtonForSlide(index);

            // ── CLEANUP ───────────────────────────────────────────────
            setTimeout(() => {
                outgoing.classList.remove('active');
                [outgoing, incoming].forEach(el => {
                    el.style.transition = '';
                    el.style.transform = '';
                    el.style.opacity = '';
                });
                // Reset button transition overrides
                mapsBtn.style.transition = '';
                creativeBtn.style.transition = '';
                isAnimating = false;
            }, SLIDE_FADE_MS + 50);

        }, SLIDE_MOVE_MS + 10);

        currentSlide = index;
        updateNavButtons();
    }


    function goNext() {
        if (currentSlide < TOTAL_SLIDES - 1) goToSlide(currentSlide + 1, 'next');
    }

    function goPrev() {
        if (currentSlide > 0) goToSlide(currentSlide - 1, 'prev');
    }



    // ─── MUSIC CONTROL ────────────────────────────────────────────
    function setMusicState(playing) {
        isPlaying = playing;
        if (playing) {
            bgAudio.play().catch(e => console.log('Audio play failed:', e));
            musicIconOn.classList.remove('hidden');
            musicIconOff.classList.add('hidden');
            musicBtn.classList.add('playing');
        } else {
            bgAudio.pause();
            musicIconOn.classList.add('hidden');
            musicIconOff.classList.remove('hidden');
            musicBtn.classList.remove('playing');
        }
    }

    musicBtn.addEventListener('click', () => {
        setMusicState(!isPlaying);
    });

    // ─── PAUSE ON TAB HIDE / PAGE BLUR ────────────────────────────
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            bgAudio.pause();
        } else {
            if (isPlaying) {
                bgAudio.play().catch(e => console.log('Audio resume failed:', e));
            }
        }
    });

    window.addEventListener('blur', () => {
        bgAudio.pause();
    });

    window.addEventListener('focus', () => {
        if (isPlaying) {
            bgAudio.play().catch(e => console.log('Audio focus-resume failed:', e));
        }
    });

    // ─── OPENING ANIMATION ────────────────────────────────────────
    openBtn.addEventListener('click', () => {
        // iOS FIX: play() MUST be called synchronously inside user interaction,
        // before any setTimeout, otherwise Safari will block it.
        const playPromise = bgAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.log('Audio play failed:', e));
        }

        // Hide the open button
        openBtn.classList.add('hide');

        // Small tick to let repaint happen, then start animations
        setTimeout(() => {
            // ─ INSTANT hide opening-screen background ─────────────────────────
            // No opacity fade — immediately gone so it can NEVER linger over slides.
            // The heart-wrapper is now a separate fixed element (z-index 25),
            // so it animates independently regardless of opening-screen visibility.
            openingScreen.style.display = 'none';

            // ─ Start portal expand ────────────────────────────────────────────
            if (sliderContainer) {
                sliderContainer.style.opacity = '1';
                sliderContainer.classList.add('open');
            }

            // ─ Heart expands (independent element, z-index 25 above slider) ──
            if (heartIcon) heartIcon.classList.add('expand');
            if (starsContainerEl) starsContainerEl.classList.add('show');

            // ─ Wire up nav immediately ────────────────────────────────────────
            updateNavButtons();
            nextBtn.addEventListener('click', goNext);
            prevBtn.addEventListener('click', goPrev);

            // ─ Show music button ──────────────────────────────────────────────
            musicBtn.classList.add('visible');
            musicBtn.classList.add('playing');

            // ─ Hide heart-wrapper after its animation fully completes ─────────
            // heart opacity transition: 1.75s + 0.35s delay = ~2.1s total
            setTimeout(() => {
                if (heartWrapper) heartWrapper.style.display = 'none';
            }, 2200);

        }, 50);
    });

});