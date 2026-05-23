document.addEventListener('DOMContentLoaded', () => {

    // ─── CONSTANTS ────────────────────────────────────────────────
    // To adjust slide transition speed, change SLIDE_DURATION (ms).
    // The CSS transition values (opacity, transform, filter) also need to match.
    const SLIDE_DURATION = 6000; // 6 seconds per slide
    const TOTAL_SLIDES = 11;     // Number of slides (slide1 → slide11)
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

    // ─── SLIDE TRANSITION (NATIVE SCROLL SNAP) ────────────────────
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    let isPlaying = true; // audio state

    // ── Hide special buttons instantly ──
    function hideSpecialButtons() {
        mapsBtn.style.opacity = '0';
        mapsBtn.style.pointerEvents = 'none';
        mapsBtn.classList.remove('show');

        creativeBtn.style.opacity = '0';
        creativeBtn.style.display = 'none';
    }

    // ── Show special button for a given slide ──
    function showSpecialButtonForSlide(index) {
        if (index === MAPS_SLIDE_INDEX) {
            mapsBtn.style.transition = 'opacity 500ms ease-in-out';
            mapsBtn.style.opacity = '1';
            mapsBtn.style.pointerEvents = 'auto';
            mapsBtn.classList.add('show');
        } else {
            mapsBtn.style.opacity = '0';
            mapsBtn.style.pointerEvents = 'none';
            mapsBtn.classList.remove('show');
        }

        if (index === TOTAL_SLIDES - 1) {
            creativeBtn.style.display = 'inline-flex';
            creativeBtn.getBoundingClientRect(); // force reflow
            creativeBtn.style.transition = 'opacity 500ms ease-in-out';
            creativeBtn.style.opacity = '1';
        } else {
            creativeBtn.style.opacity = '0';
            creativeBtn.style.display = 'none';
        }
    }

    // ─── INTERSECTION OBSERVER ────────────────────────────────────
    const observerOptions = {
        root: sliderContainer,
        rootMargin: '0px',
        threshold: 0.5 // trigger when 50% of the slide is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(slides).indexOf(entry.target);
                if (index !== -1) {
                    currentSlide = index;
                    
                    // Toggle active class
                    slides.forEach((slide, i) => {
                        if (i === index) {
                            slide.classList.add('active');
                        } else {
                            slide.classList.remove('active');
                        }
                    });

                    // Update special buttons
                    showSpecialButtonForSlide(index);

                    // ─── Replay fade-in animation ──────────────────────
                    const fadeEls = entry.target.querySelectorAll('.fade-content');
                    fadeEls.forEach(el => {
                        // Remove class, force reflow, add back to replay animation
                        el.classList.remove('animated');
                        void el.offsetWidth; // trigger reflow
                        el.classList.add('animated');
                    });
                }
            }
        });
    }, observerOptions);

    // Initialize slide observer (observe all slides)
    slides.forEach(slide => observer.observe(slide));

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

// ─── COUNTDOWN TIMER ─────────────────────────────────────────
(function startCountdown() {
    const targetDate = new Date('2026-06-10T00:00:00+07:00');

    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            document.getElementById('cd-days').innerText    = '00';
            document.getElementById('cd-hours').innerText   = '00';
            document.getElementById('cd-minutes').innerText = '00';
            document.getElementById('cd-seconds').innerText = '00';
            return;
        }

        const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const pad = n => String(n).padStart(2, '0');

        document.getElementById('cd-days').innerText    = pad(days);
        document.getElementById('cd-hours').innerText   = pad(hours);
        document.getElementById('cd-minutes').innerText = pad(minutes);
        document.getElementById('cd-seconds').innerText = pad(seconds);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
})();

// Global function to copy bank account number
function copyRekening(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerText;
        btn.innerText = 'Tersalin!';
        setTimeout(() => {
            btn.innerText = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// ─── RSVP & COMMENTS LOGIC ───────────────────────────────────────
const rsvpForm = document.getElementById('rsvp-form');
const commentsList = document.getElementById('comments-list');
const countHadirEl = document.getElementById('count-hadir');
const countTidakHadirEl = document.getElementById('count-tidak-hadir');

// Local storage key fallback
const RSVP_DB_KEY = 'wedding_rsvp_comments';

async function fetchComments() {
    let comments = [];
    try {
        // Try fetching from Vercel Serverless Function
        const response = await fetch('/api/comments');
        if (response.ok) {
            comments = await response.json();
        } else {
            throw new Error('API not available');
        }
    } catch (error) {
        // Fallback to localStorage if API is not deployed or failing
        console.log('Using LocalStorage fallback for comments');
        comments = JSON.parse(localStorage.getItem(RSVP_DB_KEY)) || [];
    }
    return comments;
}

async function postComment(newComment) {
    try {
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newComment),
        });
        
        if (!response.ok) throw new Error('API POST failed');
    } catch (error) {
        // Fallback to localStorage
        const comments = JSON.parse(localStorage.getItem(RSVP_DB_KEY)) || [];
        comments.unshift(newComment); // Add to beginning
        localStorage.setItem(RSVP_DB_KEY, JSON.stringify(comments));
    }
}

function renderComments(comments) {
    let hadirCount = 0;
    let tidakHadirCount = 0;
    
    commentsList.innerHTML = '';
    
    comments.forEach(c => {
        if (c.kehadiran === 'Hadir') hadirCount++;
        if (c.kehadiran === 'Tidak Hadir') tidakHadirCount++;
        
        const div = document.createElement('div');
        div.className = 'comment-item';
        
        // Icon logic (from screenshot: red X or green check)
        const icon = c.kehadiran === 'Hadir' ? '✅' : '❌';
        
        div.innerHTML = `
            <div class="comment-header">
                ${c.nama} <span class="comment-icon">${icon}</span>
            </div>
            <div class="comment-text">${c.ucapan}</div>
            <div class="comment-date">Baru saja</div>
        `;
        commentsList.appendChild(div);
    });
    
    countHadirEl.innerText = hadirCount;
    countTidakHadirEl.innerText = tidakHadirCount;
}

async function loadAndRenderComments() {
    if (!commentsList) return;
    const comments = await fetchComments();
    renderComments(comments);
}

if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnKirim = document.querySelector('.btn-kirim');
        const originalText = btnKirim.innerText;
        btnKirim.innerText = 'Mengirim...';
        btnKirim.disabled = true;

        const nama = document.getElementById('rsvp-nama').value;
        const ucapan = document.getElementById('rsvp-ucapan').value;
        const kehadiran = document.getElementById('rsvp-kehadiran').value;
        
        const newComment = { 
            nama, 
            ucapan, 
            kehadiran, 
            date: new Date().toISOString() 
        };
        
        await postComment(newComment);
        
        rsvpForm.reset();
        await loadAndRenderComments();
        
        btnKirim.innerText = originalText;
        btnKirim.disabled = false;
    });
    
    // Initial load
    loadAndRenderComments();
}