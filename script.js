// Scroll-controlled video playback
const video = document.getElementById('scroll-video');

// Remove autoplay - we want manual scrub control
video.removeAttribute('autoplay');
video.pause();

let rafId = null;

function updateVideoPosition() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const scrollPercent = Math.min(Math.max(scrolled / maxScroll, 0), 1);
        const targetTime = scrollPercent * video.duration;
        
        // Only update if there's a significant difference to avoid stuttering
        if (Math.abs(video.currentTime - targetTime) > 0.05) {
            video.currentTime = targetTime;
        }
        rafId = null;
    });
}

function initVideo() {
    updateVideoPosition();
    window.addEventListener('scroll', updateVideoPosition, { passive: true });
    window.addEventListener('resize', updateVideoPosition, { passive: true });
}

if (video.readyState >= 1) {
    initVideo();
} else {
    video.addEventListener('loadedmetadata', initVideo);
}

// Scroll progress indicator
let scrollIndicator = document.querySelector('.scroll-indicator');

function updateScrollIndicator() {
    if (!scrollIndicator) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const scrollPercent = scrolled / maxScroll;
    
    if (scrollPercent > 0.05) {
        scrollIndicator.style.opacity = '0';
    } else {
        scrollIndicator.style.opacity = '1';
    }
}

window.addEventListener('scroll', updateScrollIndicator, { passive: true });
updateScrollIndicator();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const scrollTarget = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
        }
    });
});

// Fade in sections on scroll
const sections = document.querySelectorAll('.feature-card, .step, .faq-item, .download-card');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Add scroll indicator to DOM
const indicatorHTML = `
    <div class="scroll-indicator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
        <span>Scroll</span>
    </div>
`;
const indicatorDiv = document.createElement('div');
indicatorDiv.innerHTML = indicatorHTML;
document.body.appendChild(indicatorDiv);
scrollIndicator = document.querySelector('.scroll-indicator');