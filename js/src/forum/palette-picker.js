import { PALETTES, applyPalette, loadStoredPalette, storePalette } from './palettes';

/**
 * Injects a circular gradient swatch button into the header that opens a
 * popover with preset palettes. Choice is persisted in localStorage.
 */
export function installPalettePicker() {
    const insertInto = findHeaderControlsHost();
    if (!insertInto) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'AuroraPaletteButton';
    button.setAttribute('aria-label', 'Choose color palette');
    button.setAttribute('aria-expanded', 'false');

    let popover = null;

    const close = () => {
        if (!popover) return;
        popover.remove();
        popover = null;
        button.setAttribute('aria-expanded', 'false');
        document.removeEventListener('click', onDocumentClick, true);
        document.removeEventListener('keydown', onKeydown);
    };

    const onDocumentClick = (e) => {
        if (popover && !popover.contains(e.target) && !button.contains(e.target)) {
            close();
        }
    };

    const onKeydown = (e) => {
        if (e.key === 'Escape') close();
    };

    const open = () => {
        popover = buildPopover((name) => {
            applyPalette(name);
            storePalette(name);
            popover.querySelectorAll('.AuroraPaletteSwatch').forEach((el) => {
                el.classList.toggle('AuroraPaletteSwatch--active', el.dataset.palette === name);
            });
        });

        // Anchor the popover beneath the button.
        button.style.position = 'relative';
        button.appendChild(popover);
        button.setAttribute('aria-expanded', 'true');

        setTimeout(() => {
            document.addEventListener('click', onDocumentClick, true);
            document.addEventListener('keydown', onKeydown);
        }, 0);
    };

    button.addEventListener('click', (e) => {
        e.stopPropagation();
        popover ? close() : open();
    });

    insertInto.insertBefore(button, insertInto.firstChild);
}

function findHeaderControlsHost() {
    return (
        document.querySelector('.Header-controls') ||
        document.querySelector('.App-header .Header-controls') ||
        document.querySelector('.App-header ul.Header-controls') ||
        document.querySelector('.App-header')
    );
}

function buildPopover(onPick) {
    const current = loadStoredPalette();

    const wrap = document.createElement('div');
    wrap.className = 'AuroraPalettePopover';
    wrap.setAttribute('role', 'dialog');

    const title = document.createElement('p');
    title.className = 'AuroraPalettePopover-title';
    title.textContent = 'Color palette';
    wrap.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'AuroraPalettePopover-grid';

    Object.entries(PALETTES).forEach(([name, p]) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'AuroraPaletteSwatch';
        if (name === current) btn.classList.add('AuroraPaletteSwatch--active');
        btn.dataset.palette = name;
        btn.setAttribute('aria-label', `Apply ${p.label} palette`);

        const swatch = document.createElement('span');
        swatch.className = 'AuroraPaletteSwatch-swatch';
        swatch.style.background = `linear-gradient(120deg, ${p.c1} 0%, ${p.c2} 35%, ${p.c3} 70%, ${p.c4} 100%)`;
        btn.appendChild(swatch);

        const label = document.createElement('span');
        label.className = 'AuroraPaletteSwatch-label';
        label.textContent = p.label;
        btn.appendChild(label);

        btn.addEventListener('click', () => onPick(name));
        grid.appendChild(btn);
    });

    wrap.appendChild(grid);
    return wrap;
}
