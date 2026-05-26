// @ts-nocheck — same transitional marker the rest of this extension uses.
import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import HeaderSecondary from 'flarum/forum/components/HeaderSecondary';
import WelcomeHero from 'flarum/forum/components/WelcomeHero';

import { applyPalette, loadStoredPalette } from './palettes';
import PaletteButton from './components/PaletteButton';
import heroWidgets from './components/HeroWidgets';

// Pre-paint: apply the stored palette as early as possible so the
// page never flashes the default colors before the user's choice is
// restored. Runs at module load — before the initializer.
applyPalette(loadStoredPalette());

app.initializers.add('ernestdefoe/aurora', () => {
    applyThemeVariables();
    enableScrollAwareHeader();
    enableRippleButtons();

    // Palette picker — added to the right-side header item list so it
    // sits alongside the user dropdown / notifications and survives
    // Mithril's reconciler tearing down the header subtree on every
    // navigation. The previous imperative `installPalettePicker` was
    // attached once at DOMContentLoaded and vanished on first route
    // change.
    extend(HeaderSecondary.prototype, 'items', function (items) {
        items.add('aurora-palette', PaletteButton.component(), 30);
    });

    // Force the welcome hero to always render. Without this override
    // a visitor who clicked the dismiss X (back when it existed) has
    // `welcomeHidden=true` in localStorage, and WelcomeHero.view()
    // returns null for them — which also kills the stat tiles below.
    // The hero still respects an empty welcomeTitle (so an operator
    // who actually wants no welcome banner can still get that by
    // clearing it in admin); we only stop honouring the per-visitor
    // dismissal.
    override(WelcomeHero.prototype, 'isHidden', function (original) {
        const title = app.forum.attribute('welcomeTitle');
        if (typeof title !== 'string' || !title.trim()) return true;
        return false;
    });

    // Hero stat tiles — rendered inside the welcome hero so the
    // glassmorphic tile styling layers correctly over the gradient
    // backdrop. Priority 60 puts them BELOW the 'content' item
    // (title + welcome message at 80) so the read order is:
    // title/message → tiles. The dismiss-button is removed below.
    //
    // Reads from `app.forum.attribute('auroraStats')`, which the
    // ForumResource extender (see extend.php) populates from the
    // cached AuroraStats snapshot. Returns null when the attribute
    // is missing so we never render fake numbers.
    extend(WelcomeHero.prototype, 'bodyItems', function (items) {
        // Drop Flarum's dismiss button — the aurora design treats
        // the hero (with its embedded stat tiles) as permanent
        // furniture, not transient onboarding chrome.
        items.remove('dismiss-button');

        const widgets = heroWidgets();
        if (widgets !== null) {
            items.add('aurora-stats', widgets, 60);
        }
    });
});

/**
 * Read the three admin color settings + three feature toggles and
 * apply them to <html> as CSS custom properties / body classes.
 *
 * Color settings were previously serialized to the forum payload but
 * never actually applied — admins saw zero visual change on save
 * (audit F1). Now they override the active palette's c1/c2/accent
 * on each boot. The user's palette picker still wins for that
 * session (re-applies via applyPalette on click), so the admin
 * config acts as a "starting point" defaults layer.
 *
 * Body-class toggles were also previously unmatched by any CSS;
 * less/forum.less now carries the matching .aurora-no-* rules.
 */
function applyThemeVariables() {
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
