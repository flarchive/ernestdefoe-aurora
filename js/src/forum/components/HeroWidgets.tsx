// @ts-nocheck — same transitional marker the rest of this extension uses.
import app from 'flarum/forum/app';

/**
 * Pure-function vnode renderer for the four hero stat tiles. Called
 * from the WelcomeHero extender in forum/index.ts; returns null when
 * no stats payload is present so the hero doesn't render an empty
 * widget row (matters on freshly-installed forums where every count
 * is still 0).
 *
 * The values come from `app.forum.attribute('auroraStats')`, which is
 * populated by the ForumResource extender in extend.php and backed by
 * AuroraStats' 60-second cache. The previous installHeroWidgets()
 * fell back to hardcoded numbers (1284 / 8742 / 53901 / 142) when
 * the attribute was absent — those misled visitors on fresh installs
 * and have been removed entirely.
 */
export default function heroWidgets() {
  const stats = app.forum.attribute('auroraStats');
  if (!stats || typeof stats !== 'object') return null;

  const t = (key) => app.translator.trans(`ernestdefoe-aurora.forum.widgets.${key}`);

  const tiles = [
    { key: 'members',     count: stats.users,       label: t('members'),     icon: iconUsers() },
    { key: 'discussions', count: stats.discussions, label: t('discussions'), icon: iconChat() },
    { key: 'posts',       count: stats.posts,       label: t('posts'),       icon: iconMessage() },
    { key: 'online',      count: stats.online,      label: t('online'),      icon: iconPulse() },
  ];

  // Drop tiles where the count is null/undefined. A count of zero is
  // still meaningful (real signal: "no discussions yet") and stays
  // visible, but missing data (the attribute didn't ship the key)
  // hides cleanly instead of showing 0 as a fake value.
  const renderable = tiles.filter((t) => t.count !== null && t.count !== undefined);
  if (renderable.length === 0) return null;

  return (
    <div className="HeroWidgets">
      {renderable.map((tile) => (
        <div key={tile.key} className={`HeroWidget HeroWidget--${tile.key}`}>
          <div className="HeroWidget-label">
            {m.trust(tile.icon)}
            <span>{tile.label}</span>
          </div>
          <div className="HeroWidget-value">{formatCount(tile.count)}</div>
        </div>
      ))}
    </div>
  );
}

function formatCount(n) {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (v >= 10_000) return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return v.toLocaleString();
}

// SVG icons — kept inline so we don't need an asset pipeline. The
// HTML markup ships unchanged from the original imperative renderer
// (which used innerHTML); m.trust is safe here because the strings
// are compile-time constants, NOT user input.

function svg(inner) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

function iconUsers() {
  return svg(
    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>' +
    '<circle cx="9" cy="7" r="4"/>' +
    '<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>' +
    '<path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
  );
}

function iconChat() {
  return svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>');
}

function iconMessage() {
  return svg(
    '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'
  );
}

function iconPulse() {
  return svg('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>');
}
