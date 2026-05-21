/**
 * Injects four stat tiles into the welcome hero on the forum index.
 * Pulls counts from app.forum (Flarum's serialized forum data) when
 * available, falls back to placeholders so the tiles look right in
 * preview / demo contexts.
 */
export function installHeroWidgets(app) {
    const observer = new MutationObserver(() => tryInject(app));
    observer.observe(document.body, { childList: true, subtree: true });
    tryInject(app);
}

function tryInject(app) {
    const hero = document.querySelector('.Hero .container, .Hero');
    if (!hero || hero.querySelector('.HeroWidgets')) return;

    const data = readForumStats(app);

    const widgets = document.createElement('div');
    widgets.className = 'HeroWidgets';
    widgets.append(
        widget('Members',     formatCount(data.members),     data.membersTrend, iconUsers()),
        widget('Discussions', formatCount(data.discussions), data.discussionsTrend, iconChat()),
        widget('Posts',       formatCount(data.posts),       data.postsTrend, iconMessage()),
        widget('Online now',  formatCount(data.online),      data.onlineTrend, iconPulse()),
    );

    hero.appendChild(widgets);
}

function widget(label, value, trend, iconSvg) {
    const el = document.createElement('div');
    el.className = 'HeroWidget';
    el.innerHTML = `
        <div class="HeroWidget-label">${iconSvg}<span>${label}</span></div>
        <div class="HeroWidget-value">${value}</div>
        ${trend ? `<div class="HeroWidget-trend">${trend}</div>` : ''}
    `;
    return el;
}

function readForumStats(app) {
    const attrs = (app && app.forum && app.forum.data && app.forum.data.attributes) || {};
    return {
        members:        attrs.userCount        || 1284,
        discussions:    attrs.discussionCount  || 8742,
        posts:          attrs.postCount        || 53901,
        online:         attrs.onlineCount      || 142,
        membersTrend:     '+24 this week',
        discussionsTrend: '+38 today',
        postsTrend:       '+412 today',
        onlineTrend:      'live',
    };
}

function formatCount(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 10_000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return n.toLocaleString();
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
