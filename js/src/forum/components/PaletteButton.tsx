// @ts-nocheck — same transitional marker the rest of this extension uses.
import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';

import { PALETTES, applyPalette, loadStoredPalette, storePalette } from '../palettes';

/**
 * Gradient swatch button + popover that lets the visitor pick one of
 * the preset palettes. Rendered via extend(HeaderSecondary.prototype,
 * 'items', ...) — being a real Mithril component means it survives
 * the SPA reconciler tearing the header subtree down on navigation /
 * notification updates. The previous imperative `installPalettePicker`
 * was attached once at DOMContentLoaded and disappeared on the first
 * route change.
 */
export default class PaletteButton extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.open = false;
    this.current = loadStoredPalette();

    this.onDocumentClick = (e) => {
      if (!this.open) return;
      if (this.element && !this.element.contains(e.target)) {
        this.open = false;
        m.redraw();
      }
    };

    this.onKeydown = (e) => {
      if (e.key === 'Escape' && this.open) {
        this.open = false;
        m.redraw();
      }
    };
  }

  oncreate(vnode) {
    super.oncreate(vnode);
    document.addEventListener('click', this.onDocumentClick, true);
    document.addEventListener('keydown', this.onKeydown);
  }

  onremove(vnode) {
    super.onremove(vnode);
    document.removeEventListener('click', this.onDocumentClick, true);
    document.removeEventListener('keydown', this.onKeydown);
  }

  view() {
    const t = (key) => app.translator.trans(`ernestdefoe-aurora.forum.palette.${key}`);

    return (
      <button
        type="button"
        className="AuroraPaletteButton"
        aria-label={t('button_label')}
        aria-expanded={this.open ? 'true' : 'false'}
        onclick={(e) => {
          e.stopPropagation();
          this.open = !this.open;
        }}
      >
        <span className="AuroraPaletteButton-label">{t('palette')}</span>

        {this.open && this.popover(t)}
      </button>
    );
  }

  popover(t) {
    return (
      <div className="AuroraPalettePopover" role="dialog">
        <p className="AuroraPalettePopover-title">{t('title')}</p>
        <div className="AuroraPalettePopover-grid">
          {Object.entries(PALETTES).map(([name, p]) => (
            <button
              key={name}
              type="button"
              className={
                'AuroraPaletteSwatch' +
                (name === this.current ? ' AuroraPaletteSwatch--active' : '')
              }
              data-palette={name}
              aria-label={app.translator.trans(
                'ernestdefoe-aurora.forum.palette.apply',
                { palette: this.localizedLabel(t, name, p.label) }
              )}
              onclick={(e) => {
                e.stopPropagation();
                applyPalette(name);
                storePalette(name);
                this.current = name;
              }}
            >
              <span
                className="AuroraPaletteSwatch-swatch"
                style={{
                  background: `linear-gradient(120deg, ${p.c1} 0%, ${p.c2} 35%, ${p.c3} 70%, ${p.c4} 100%)`,
                }}
              />
              <span className="AuroraPaletteSwatch-label">
                {this.localizedLabel(t, name, p.label)}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Lookup a localized name for a palette key. Falls back to the
   * built-in English label on `PALETTES.<name>.label` when the
   * locale doesn't have an entry for that palette — keeps custom
   * palettes addable without forcing a translation.
   */
  localizedLabel(t, name, fallback) {
    const localized = t(name);
    // app.translator.trans returns the missing key verbatim when no
    // translation exists; detect that so we fall back to PALETTES.label.
    const key = `ernestdefoe-aurora.forum.palette.${name}`;
    const looksMissing =
      typeof localized === 'string' && localized === key;
    return looksMissing ? fallback : localized;
  }
}
