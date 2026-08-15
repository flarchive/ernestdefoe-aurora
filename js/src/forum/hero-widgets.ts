// @ts-nocheck — same transitional marker the rest of this extension uses.
import extractText from 'flarum/common/utils/extractText';

/**
 * Injects up to four stat tiles into the welcome hero on the forum index.
 *
 * Counts come from `app.forum.attribute('auroraStats')`, which the
 * ForumSerializer extender in extend.php populates from the cached
 * AuroraStats snapshot. The previous version fabricated trend labels
 * ('+24 this week' etc.) and fell back to hardcoded numbers
 * (1284 / 8742 / 53901 / 142) — both flagged by the audit (F4 / F8) as
 * misleading; both are gone. Missing counts hide their tile; a real 0
 * stays visible.
 *
 * Injection is one-shot per page: tryInject() runs immediately, and a
 * short-lived MutationObserver only watches until the hero appears, then
 * disconnects — so we never leave a body-subtree observer running for the
 * session (audit F5). The caller (index.ts) re-arms this on every IndexPage
 * mount, so it survives SPA navigation without a permanent observer.
 */
export function installHeroWidgets(app) {
    if (tryInject(app)) return;

    const observer = new MutationObserver(() => {
        if (tryInject(app)) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Safety valve: stop watching after 10s even if the hero never appears
    // (e.g. welcome hero disabled) so the observer can't leak.
    setTimeout(() => observer.disconnect(), 10000);
}

/**
 * @return true when there is nothing left to do (injected, already present,
 *         or no data / hero) so the observer can stop; false to keep watching.
 */
function tryInject(app): boolean {
    const hero = document.querySelector('.Hero .container, .Hero');
    if (!hero) return false;
    if (hero.querySelector('.HeroWidgets')) return true;

    const tiles = buildTiles(app);
    if (tiles.length === 0) return true;

    const widgets = document.createElement('div');
    widgets.className = 'HeroWidgets';
    tiles.forEach((tile) => widgets.appendChild(widget(tile.label, formatCount(tile.count), tile.icon)));
    hero.appendChild(widgets);
    return true;
}

function buildTiles(app) {
    const stats = (app && app.forum && typeof app.forum.attribute === 'function')
        ? app.forum.attribute('auroraStats')
        : null;
    if (!stats || typeof stats !== 'object') return [];

    const t = (key) => extractText(app.translator.trans(`ernestdefoe-aurora.forum.widgets.${key}`));

    const defs = [
        { count: stats.users,       label: t('members'),     icon: iconUsers() },
        { count: stats.discussions, label: t('discussions'), icon: iconChat() },
        { count: stats.posts,       label: t('posts'),       icon: iconMessage() },
        { count: stats.online,      label: t('online'),      icon: iconPulse() },
    ];

    // Drop tiles whose count is null/undefined (data not shipped). A real 0 is
    // meaningful signal ("no discussions yet") and stays visible.
    return defs.filter((d) => d.count !== null && d.count !== undefined);
}

function widget(label, value, iconSvg) {
    const el = document.createElement('div');
    el.className = 'HeroWidget';
    // iconSvg is a compile-time constant; label comes from the locale file and
    // value is number-derived — none are user input, so innerHTML is safe here.
    el.innerHTML = `
        <div class="HeroWidget-label">${iconSvg}<span>${label}</span></div>
        <div class="HeroWidget-value">${value}</div>
    `;
    return el;
}

function formatCount(n) {
    const v = Number(n) || 0;
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (v >= 10_000) return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return v.toLocaleString();
}

function iconUsers() {
    return svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>');
}

function iconChat() {
    return svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>');
}

function iconMessage() {
    return svg('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>');
}

function iconPulse() {
    return svg('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>');
}

function svg(inner) {
    return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
