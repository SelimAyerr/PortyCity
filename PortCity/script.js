// global like counter (must be a global variable)
var likeCount = 0;

document.addEventListener('DOMContentLoaded', function () {
    showWelcome({
        title: "PortCity'ye Hoş Geldiniz",
        message: 'PortCity Tanıtım Sitesine Hoş Geldiniz',
        autoHideMs: 6000,
        oncePerSession: true
    });
    initMenuInteraction();
    initActiveMenu();
    initThemeToggle();
    initActivityTooltips();
    initDynamicActivities();
    initLikeButton();
    initContactForm();
    initImageZoom();
});

function showWelcome(options) {
    options = Object.assign({ title: 'Hoş Geldiniz', message: '', autoHideMs: 0, oncePerSession: false }, options || {});

    try {
        if (options.oncePerSession && sessionStorage.getItem('pcWelcomeShown')) return;
    } catch (e) {}

    if (!document.getElementById('pc-welcome-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'pc-welcome-overlay';
        overlay.className = 'pc-welcome-overlay';
        overlay.innerHTML = `
            <div class="pc-welcome-modal" role="dialog" aria-modal="true" aria-labelledby="pc-welcome-title">
                <button class="pc-welcome-close" aria-label="Kapat">&times;</button>
                <h2 id="pc-welcome-title"></h2>
                <p class="pc-welcome-message"></p>
            </div>
        `;
        document.body.appendChild(overlay);

        const closeBtn = overlay.querySelector('.pc-welcome-close');
        const modal = overlay.querySelector('.pc-welcome-modal');

        function hide() {
            overlay.classList.remove('visible');
            setTimeout(() => { try { overlay.remove(); } catch (e) {} }, 300);
        }

        closeBtn.addEventListener('click', hide);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) hide(); });
        document.addEventListener('keydown', function onKey(e) { if (e.key === 'Escape') { hide(); document.removeEventListener('keydown', onKey); } });
    }

    const overlayEl = document.getElementById('pc-welcome-overlay');
    if (!overlayEl) return;
    overlayEl.querySelector('#pc-welcome-title').textContent = options.title;
    overlayEl.querySelector('.pc-welcome-message').textContent = options.message;

    // small delay to allow CSS animations
    requestAnimationFrame(() => overlayEl.classList.add('visible'));

    if (options.autoHideMs && options.autoHideMs > 0) {
        setTimeout(() => {
            try { overlayEl.classList.remove('visible'); } catch (e) {}
            try { sessionStorage.setItem('pcWelcomeShown', '1'); } catch (e) {}
        }, options.autoHideMs);
    } else {
        try { sessionStorage.setItem('pcWelcomeShown', '1'); } catch (e) {}
    }
}

function initMenuInteraction() {
    const links = document.querySelectorAll('.nav a');
    if (!links || links.length === 0) return;

    links.forEach(link => {
        link.addEventListener('mouseover', function () {
            // store original color if not stored
            if (!this.dataset._pcOrigColor) {
                try { this.dataset._pcOrigColor = window.getComputedStyle(this).color; } catch (e) { this.dataset._pcOrigColor = ''; }
            }
            this.style.color = '#ffd100';
        });

        link.addEventListener('mouseout', function () {
            // restore original color
            if (this.dataset._pcOrigColor) {
                this.style.color = this.dataset._pcOrigColor;
            } else {
                this.style.removeProperty('color');
            }
        });
    });
}

function initActiveMenu() {
    const links = document.querySelectorAll('.nav a');
    if (!links || links.length === 0) return;

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            // remove active from all
            links.forEach(l => l.classList.remove('active'));
            // add active to clicked
            this.classList.add('active');
            try { localStorage.setItem('pcActiveLink', this.getAttribute('href')); } catch (e) {}
        });
    });

    // set initial active based on stored preference or current path
    try {
        const normalize = s => (s || '').toString().split('/').pop().toLowerCase();

        // prefer stored active link (set on click) so active persists across page loads
        const stored = localStorage.getItem('pcActiveLink');
        if (stored) {
            const storedNorm = normalize(stored);
            const match = Array.from(links).find(l => normalize(l.getAttribute('href')) === storedNorm || normalize(new URL(l.getAttribute('href'), location.href).pathname) === storedNorm);
            if (match) { links.forEach(l => l.classList.remove('active')); match.classList.add('active'); return; }
        }

        
        let current = normalize(location.pathname);
        if (!current || current === '/') current = 'index.html';

        
        const match = Array.from(links).find(l => {
            try {
                const hrefAttr = l.getAttribute('href');
                const linkName = normalize(hrefAttr);
                const absName = normalize(new URL(hrefAttr, location.href).pathname);
                return linkName === current || absName === current;
            } catch (e) { return false; }
        });

        if (match) { links.forEach(l => l.classList.remove('active')); match.classList.add('active'); }
    } catch (e) {}
}


function ensureIndexActive() {
    try {
        const links = document.querySelectorAll('.nav a');
        if (!links || links.length === 0) return;
        const hrefs = Array.from(links).map(l => l.getAttribute('href'));
        const isIndex = (function () {
            const p = (location.pathname || '').toLowerCase();
            if (p.endsWith('index.html')) return true;
            
            if (p === '/' || p === '') return true;
           
            if ((location.href || '').toLowerCase().indexOf('index.html') !== -1) return true;
            return false;
        })();

        if (isIndex) {
            const match = Array.from(links).find(l => (l.getAttribute('href')||'').toLowerCase().indexOf('index.html') !== -1 || (l.textContent||'').trim().toLowerCase() === 'ana sayfa');
            if (match) { links.forEach(l => l.classList.remove('active')); match.classList.add('active'); }
        }
    } catch (e) {}
}


try { ensureIndexActive(); } catch (e) {}


function initThemeToggle() {
    const themes = ['theme-default', 'theme-dark', 'theme-sunset'];
    const key = 'pcTheme';

    function applyTheme(theme) {
        themes.forEach(t => document.body.classList.remove(t));
        document.body.classList.add(theme);
        try { localStorage.setItem(key, theme); } catch (e) {}
    }

   
    try {
        const stored = localStorage.getItem(key) || 'theme-default';
        applyTheme(stored);
    } catch (e) { applyTheme('theme-default'); }

    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
       
        const current = themes.find(t => document.body.classList.contains(t)) || 'theme-default';
        const idx = themes.indexOf(current);
        const next = themes[(idx + 1) % themes.length];
        applyTheme(next);
    });
}

function initActivityTooltips() {
    const selector = '[data-info], .has-info';
    const items = document.querySelectorAll(selector);
    if (!items || items.length === 0) return;

   
    let tooltip = document.getElementById('pc-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'pc-tooltip';
        tooltip.className = 'pc-tooltip';
        document.body.appendChild(tooltip);
    }

    function showTip(el, evt) {
        const text = el.getAttribute('data-info') || el.dataset.info || '';
        if (!text) return;
        tooltip.textContent = text;
        const rect = el.getBoundingClientRect();
        const top = window.scrollY + rect.top - 10 - tooltip.offsetHeight;
        const left = window.scrollX + rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
       
        tooltip.style.left = (left < 8 ? 8 : left) + 'px';
        tooltip.style.top = (top < 8 ? rect.bottom + 12 + 'px' : top + 'px');
        tooltip.classList.add('visible');
    }

    function hideTip() {
        tooltip.classList.remove('visible');
    }

    items.forEach(el => {
        el.addEventListener('mouseover', function (e) {
            showTip(el, e);
        });
        el.addEventListener('mouseout', function () {
            hideTip();
        });
    });
}

function initDynamicActivities() {
    const activities = [
        "Tekne Turu",
        "Dalış Deneyimi",
        "Marina Restoranları",
        "Gün Batımı Yürüyüşü"
    ];

    const container = document.getElementById('dynamic-activities');
    if (!container) return;

   
    activities.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        li.className = 'dynamic-activity';
        container.appendChild(li);
    });
}

function initLikeButton() {
    const btn = document.getElementById('like-btn');
    const display = document.getElementById('like-count');
    if (!btn || !display) return;

    
    display.textContent = String(likeCount);

    btn.addEventListener('click', function () {
       
        likeCount = likeCount + 1;
       
        display.textContent = String(likeCount);
    });
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = (form.querySelector('[name="name"]') || {}).value || '';
        const email = (form.querySelector('[name="email"]') || {}).value || '';
        const message = (form.querySelector('[name="message"]') || {}).value || '';

        if (!name.trim() || !email.trim() || !message.trim()) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }

       
        alert('Mesajınız başarıyla gönderildi');
        try { form.reset(); } catch (err) {}
    });
}

function initImageZoom() {
    const imgs = document.querySelectorAll('.zoomable');
    if (!imgs || imgs.length === 0) return;

    imgs.forEach(img => {
        img.addEventListener('click', function (e) {
          
            try { e.preventDefault(); e.stopPropagation(); } catch (err) {}
            this.classList.toggle('zoomed');
        });

        const parentLink = img.closest('a');
        if (parentLink) {
            parentLink.addEventListener('click', function (e) {
                try {
                    const rect = img.getBoundingClientRect();
                    const x = e.clientX, y = e.clientY;
                    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                } catch (err) {}
            });
        }

        img.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.toggle('zoomed');
            }
        });
    });
}
