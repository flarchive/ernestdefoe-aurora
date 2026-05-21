import app from 'flarum/forum/app';
import { applyPalette, loadStoredPalette } from './palettes';
import { installPalettePicker } from './palette-picker';
import { installHeroWidgets } from './hero-widgets';

// Apply the stored palette as early as possible so the page never flashes
// the default colors before the user's choice is restored.
applyPalette(loadStoredPalette());

app.initializers.add('ernestdefoe/aurora', () => {
    applyThemeVariables();

    // Re-apply on every page render in case Flarum tears down the header.
    const install = () => {
        installPalettePicker();
        installHeroWidgets(app);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', install);
    } else {
        install();
    }

    enableScrollAwareHeader();
    enableRippleButtons();
});

function applyThemeVariables() {
    // app.forum may not be hydrated yet on first boot — guard defensively.
    const get = (key) => (app && app.forum && typeof app.forum.attribute === 'function')
        ? app.forum.attribute(key)
        : undefined;

    if (get('aurora-theme.animate_background') === false) {
        document.body.classList.add('aurora-no-animation');
    }
    if (get('aurora-theme.enable_glassmorphism') === false) {
        document.body.classList.add('aurora-no-glass');
    }
    if (get('aurora-theme.enable_glow') === false) {
        document.body.classList.add('aurora-no-glow');
    }
}

function enableScrollAwareHeader() {
    const header = document.querySelector('.App-header');
    if (!header) return;

    let lastY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;

        requestAnimationFrame(() => {
            const y = window.scrollY;
            header.classList.toggle('Aurora-header--scrolled', y > 12);
            header.classList.toggle('Aurora-header--hidden', y > lastY && y > 120);
            lastY = y;
            ticking = false;
        });
    }, { passive: true });
}

function enableRippleButtons() {
    document.addEventListener('click', (event) => {
        const button = event.target.closest('.Button--primary');
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'Aurora-ripple';
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });
}
