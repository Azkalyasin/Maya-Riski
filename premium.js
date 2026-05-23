/* ═══════════════════════════════════════════════════════════════════════ */
/* PREMIUM WEDDING INVITATION - JAVASCRIPT                               */
/* ═══════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // ═══════════════════════════════════════════════════════════════════
    // 1. PARTICLE STARS GENERATION
    // ═══════════════════════════════════════════════════════════════════

    const starsContainer = document.getElementById('starsContainer');
    const starCount = 150;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 2 + 1;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 5;

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--duration', `${duration}s`);
        star.style.animationDelay = `${delay}s`;

        starsContainer.appendChild(star);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 2. SLIDE NAVIGATION LOGIC
    // ═══════════════════════════════════════════════════════════════════

    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentSlide = 0;
    const autoSlideInterval = 8000; // 8 seconds
    let slideTimer;

    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const slideIndicator = document.getElementById('slideIndicator');

    function updateSlide(newIndex) {
        // Validasi
        if (newIndex < 0 || newIndex >= totalSlides) return;

        // Remove active dari slide sebelumnya
        slides[currentSlide].classList.remove('active');

        // Set slide baru
        currentSlide = newIndex;
        slides[currentSlide].classList.add('active');

        // Update indicator
        slideIndicator.textContent = `${currentSlide + 1} / ${totalSlides}`;

        // Update button states
        updateButtonStates();

        // Reset auto-slide timer
        resetAutoSlide();
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            updateSlide(currentSlide + 1);
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            updateSlide(currentSlide - 1);
        }
    }

    function updateButtonStates() {
        // Disable next button jika di slide terakhir
        if (currentSlide === totalSlides - 1) {
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.3';
        } else {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
        }

        // Disable prev button jika di slide pertama
        if (currentSlide === 0) {
            prevBtn.disabled = true;
            prevBtn.style.opacity = '0.3';
        } else {
            prevBtn.disabled = false;
            prevBtn.style.opacity = '1';
        }
    }

    function autoSlide() {
        if (currentSlide < totalSlides - 1) {
            nextSlide();
        } else {
            // Loop kembali ke awal (optional)
            updateSlide(0);
        }
    }

    function resetAutoSlide() {
        clearInterval(slideTimer);
        slideTimer = setInterval(autoSlide, autoSlideInterval);
    }

    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
    });

    // Touch/Swipe navigation
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide(); // Swipe left = next
            } else {
                prevSlide(); // Swipe right = prev
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 3. AUDIO & MUTE CONTROL
    // ═══════════════════════════════════════════════════════════════════

    const bgAudio = document.getElementById('bgAudio');
    const muteBtn = document.getElementById('muteBtn');
    const muteBtnText = document.getElementById('muteBtnText');
    let isMuted = false;

    function playAudio() {
        if (bgAudio) {
            bgAudio.play().catch(e => {
                console.log('Audio play failed:', e);
            });
            muteBtn.style.display = 'inline-block';
        }
    }

    function toggleMute() {
        if (isMuted) {
            bgAudio.play();
            muteBtn.style.background = 'rgba(212, 175, 55, 0.9)';
            muteBtnText.textContent = '🔊 Mute';
            isMuted = false;
        } else {
            bgAudio.pause();
            muteBtn.style.background = 'rgba(120, 120, 120, 0.9)';
            muteBtnText.textContent = '🔇 Unmute';
            isMuted = true;
        }
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', toggleMute);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 4. OPENING ANIMATION
    // ═══════════════════════════════════════════════════════════════════

    const openBtn = document.getElementById('openBtn');
    const heartIcon = document.getElementById('heartIcon');
    const sliderContainer = document.getElementById('sliderContainer');
    const openingScreen = document.getElementById('openingScreen');
    const starsContainerEl = document.getElementById('starsContainer');

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            // Play audio
            playAudio();

            // Hide button
            openBtn.classList.add('hide');

            // Start animations
            setTimeout(() => {
                if (sliderContainer) {
                    sliderContainer.style.opacity = '1';
                    sliderContainer.classList.add('open');
                }
                if (heartIcon) heartIcon.classList.add('expand');
                if (starsContainerEl) starsContainerEl.classList.add('show');

                // Wait for portal animation
                setTimeout(() => {
                    openingScreen.style.opacity = '0';

                    // Start auto-slide
                    resetAutoSlide();
                    updateButtonStates();

                    setTimeout(() => {
                        openingScreen.style.display = 'none';
                    }, 1500);
                }, 3000);
            }, 50);
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    // 5. INITIALIZE
    // ═══════════════════════════════════════════════════════════════════

    // Set initial button states (sebelum pembukaan)
    updateButtonStates();

    console.log('✨ Premium Wedding Invitation Ready!');
    console.log(`Total slides: ${totalSlides}`);
});
