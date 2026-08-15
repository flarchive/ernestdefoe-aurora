// @ts-nocheck — TODO: declare class properties + parameter types
// Transitional marker from the audit-driven TS conversion. The
// underlying JS uses Flarum's `this.foo = ...` initialiser pattern
// which TypeScript strict mode rejects. Remove once a follow-up pass
// adds explicit property declarations and vnode/callback types.
import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import HeaderSecondary from 'flarum/forum/components/HeaderSecondary';
import IndexPage from 'flarum/forum/components/IndexPage';
import { applyPalette, loadStoredPalette } from './palettes';
import PaletteButton from './components/PaletteButton';
import { installHeroWidgets } from './hero-widgets';

// Apply the stored palette as early as possible so the page never flashes
// the default colors before the user's choice is restored.
applyPalette(loadStoredPalette());

app.initializers.add('ernestdefoe/aurora', () => {
    applyThemeVariables();

    // Palette picker — registered as a Mithril item on the header's secondary
    // controls so it survives the SPA reconciler tearing the header subtree
    // down on navigation. The previous imperative installPalettePicker() was
    // attached once at DOMContentLoaded and vanished on the first route change
    // (audit F3).
    extend(HeaderSecondary.prototype, 'items', function (items) {
        items.add('aurora-palette', PaletteButton.component(), 30);
    });

    // Hero stat tiles — injected into the welcome hero on the index page.
    // Re-armed on every IndexPage mount (Mithril lifecycle) so they survive
    // navigation, and the injecting MutationObserver disconnects as soon as it
    // succeeds rather than running for the whole session (audit F5).
    extend(IndexPage.prototype, 'oncreate', function () {
        installHeroWidgets(app);
    });

    enableScrollAwareHeader();
    enableRippleButtons();
});

/**
 * Read the three admin color settings + three feature toggles and apply them
 * to the document as CSS custom properties / body classes.
 *
 * The color settings were previously serialized to the forum payload but never
 * actually applied — an admin who changed the gradient saw zero visual change
 * (audit F1). They now seed --aurora-c1/c2/accent on boot; the palette picker
 * still wins for the current session (it re-applies via applyPalette on click),
 * so the admin config behaves as a defaults layer.
 *
 * The body-class toggles were likewise unmatched by any CSS; less/forum.less
 * now carries the matching body.aurora-no-* rules (audit F2).
 */
function applyThemeVariables() {
    // app.forum may not be hydrated yet on first boot — guard defensively.
    const get = (key) => (app && app.forum && typeof app.forum.attribute === 'function')
        ? app.forum.attribute(key)
        : undefined;

    const setVar = (name, value) => {
        if (typeof value === 'string' && value.trim() !== '') {
            document.documentElement.style.setProperty(name, value.trim());
        }
    };

    setVar('--aurora-c1',     get('aurora-theme.primary_gradient_start'));
    setVar('--aurora-c2',     get('aurora-theme.primary_gradient_end'));
    setVar('--aurora-accent', get('aurora-theme.accent_color'));

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
