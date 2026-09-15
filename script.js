// Scroll-driven alpha frame sequence + download gate
const canvas = document.getElementById('fx-canvas');
const ctx = canvas.getContext('2d');
const overlay = canvas.parentElement;
const loader = document.getElementById('loader');
const loadpct = document.getElementById('loadpct');
const holeDl = document.getElementById('holeDl');

const FRAME_COUNT = 251;
const FRAME_START = 130;
const SCRINT_VIEWS = 3;
const HOLE_U = 0.71;
const HOLE_V = 0.46;
const DL_FILE = 'tut_bend_effect.zip';
const frames = new Array(FRAME_COUNT);
let loadedCount = 0;
let lastFrame = -1;

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const nameFor = i => `frames/dfsfsfsf${String(FRAME_START + i).padStart(4, '0')}.webp`;

function loadFrame(i) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            frames[i] = img;
            loadedCount++;
            loadpct.textContent = Math.round(loadedCount / FRAME_COUNT * 100) + '%';
            if (loadedCount === FRAME_COUNT) loader.classList.add('hidden');
            resolve();
        };
        img.onerror = resolve;
        img.src = nameFor(i);
    });
}

async function preload() {
    const order = [];
    const step = Math.max(1, Math.floor(FRAME_COUNT / 24));
    for (let i = 0; i < FRAME_COUNT; i += step) order.push(i);
    const rest = [];
    for (let i = 0; i < FRAME_COUNT; i++) if (!order.includes(i)) rest.push(i);

    const queue = [...order, ...rest];
    let idx = 0;
    const workers = Array.from({ length: 6 }, async () => {
        while (idx < queue.length) await loadFrame(queue[idx++]);
    });
    await Promise.all(workers);
}

function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    lastFrame = -1;
}

function drawFrame(i) {
    const img = frames[i];
    if (!img) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const w = img.width * scale, h = img.height * scale;
    ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
}

function placeHoleBtn() {
    const cw = overlay.clientWidth, ch = overlay.clientHeight;
    const s = Math.max(cw / 1280, ch / 720);
    const w = 1280 * s, h = 720 * s;
    const x = (cw - w) / 2 + HOLE_U * w;
    const y = (ch - h) / 2 + HOLE_V * h;
    holeDl.style.left = x + 'px';
    holeDl.style.top = y + 'px';
}

function updateSequence() {
    const total = innerHeight * SCRINT_VIEWS;
    const p = clamp(scrollY / total, 0, 1);

    holeDl.classList.toggle('visible', p > 0.8);
    placeHoleBtn();

    const fi = Math.round(p * (FRAME_COUNT - 1));
    if (fi === lastFrame) return;
    let cur = fi;
    let guard = 0;
    while (!frames[cur] && cur > 0 && guard++ < FRAME_COUNT) cur--;
    if (!frames[cur]) {
        cur = fi; guard = 0;
        while (!frames[cur] && cur < FRAME_COUNT - 1 && guard++ < FRAME_COUNT) cur++;
    }
    if (frames[cur]) { drawFrame(cur); lastFrame = cur; }
}

let rafId = null;
function requestUpdate() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => { rafId = null; updateSequence(); });
}

// Scroll indicator
let scrollIndicator = document.querySelector('.scroll-indicator');

function updateScrollIndicator() {
    if (!scrollIndicator) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    scrollIndicator.style.opacity = (maxScroll && scrolled / maxScroll > 0.05) ? '0' : '1';
}

window.addEventListener('scroll', () => { requestUpdate(); updateScrollIndicator(); }, { passive: true });
window.addEventListener('resize', () => { resize(); requestUpdate(); });

resize();
requestUpdate();
preload();

// ---------- download gate ----------
const modal = document.getElementById('lockModal');
const unlockBtn = document.getElementById('unlockBtn');
const unlockedTag = document.getElementById('unlockedTag');
const lockClose = document.getElementById('lockClose');
const KEY = 'tutbend_unlocked';

const isUnlocked = () => localStorage.getItem(KEY) === '1';

function startDownload() {
    const a = document.createElement('a');
    a.href = DL_FILE;
    a.download = DL_FILE;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-lock]');
    if (!trigger) return;
    if (isUnlocked()) return;
    e.preventDefault();
    modal.hidden = false;
    unlockedTag.hidden = true;
    document.body.style.overflow = 'hidden';
});

unlockBtn.addEventListener('click', () => {
    localStorage.setItem(KEY, '1');
    startDownload();
    unlockBtn.textContent = 'فالو کردید ✓';
    unlockBtn.disabled = true;
    unlockedTag.hidden = false;
    setTimeout(closeModal, 1600);
});

function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
}
lockClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

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
