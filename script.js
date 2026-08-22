// =====================================================
// MIMBRE RECORDS — interacciones
// =====================================================

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Reveal on scroll ---------------------------------
const revealEls = document.querySelectorAll('.reveal');

if (reducedMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
} else if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach(el => revealObserver.observe(el));
} else {
    revealEls.forEach(el => el.classList.add('is-visible'));
}

// --- Parallax en la imagen "seam" ---------------------
const seamWrap = document.querySelector('.seam-image-wrap');
const seamSection = document.querySelector('.seam');

if (seamWrap && seamSection && !reducedMotion) {
    let ticking = false;

    const updateParallax = () => {
        const rect = seamSection.getBoundingClientRect();
        const vh = window.innerHeight;
        // progreso de -1 (arriba de la pantalla) a 1 (abajo de la pantalla)
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        const offset = progress * 40; // px de desplazamiento máximo
        seamWrap.style.transform = `translateY(${offset}px)`;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });

    updateParallax();
}

// --- Tilt 3D en la portada del álbum ------------------
const albumCard = document.getElementById('albumCard');
const albumCover = document.getElementById('albumCover');
const supportsHover = window.matchMedia('(hover: hover)').matches;

if (albumCard && albumCover && supportsHover && !reducedMotion) {
    albumCard.addEventListener('mousemove', (e) => {
        const rect = albumCard.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateY = x * 14;
        const rotateX = y * -14;
        albumCover.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    albumCard.addEventListener('mouseleave', () => {
        albumCover.style.transform = 'rotateX(0) rotateY(0)';
    });
}

// --- Typewriter en la línea de métricas ---------------
const metricsText = document.getElementById('metricsText');

if (metricsText) {
    const fullText = metricsText.getAttribute('data-full') || '';

    if (reducedMotion) {
        metricsText.textContent = fullText;
    } else if ('IntersectionObserver' in window) {
        let typed = false;

        const typeIt = () => {
            let i = 0;
            const interval = setInterval(() => {
                metricsText.textContent = fullText.slice(0, i + 1);
                i++;
                if (i >= fullText.length) clearInterval(interval);
            }, 35);
        };

        const metricsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !typed) {
                    typed = true;
                    typeIt();
                    metricsObserver.disconnect();
                }
            });
        }, { threshold: 0.5 });

        metricsObserver.observe(metricsText);
    } else {
        metricsText.textContent = fullText;
    }
}

// --- Compartir link de Spotify -------------------------
const shareBtn = document.getElementById('share-spotify-btn');

if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
        const url = shareBtn.getAttribute('data-share-url');
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Vía Luma - Mimbre Records',
                    text: 'Escucha Vía Luma en Spotify',
                    url: url
                });
            } catch (err) {
                // usuario canceló, no hacemos nada
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                const original = shareBtn.getAttribute('aria-label');
                shareBtn.setAttribute('aria-label', 'Link copiado');
                setTimeout(() => {
                    shareBtn.setAttribute('aria-label', original);
                }, 1500);
            } catch (err) {
                // clipboard no disponible, no hacemos nada
            }
        }
    });
}
