// @ts-nocheck — TODO: declare class properties + parameter types
// Transitional marker from the audit-driven TS conversion. The
// underlying JS uses Flarum's `this.foo = ...` initialiser pattern
// which TypeScript strict mode rejects. Remove once a follow-up pass
// adds explicit property declarations and vnode/callback types.
// Preset palettes the user can switch between via the header picker.
// Each entry: [c1, c2, c3, c4] for the gradient + accent + 5 backdrop blobs.

export const PALETTES = {
    aurora: {
        label: 'Aurora',
        c1: '#7c3aed', c2: '#4f46e5', c3: '#22d3ee', c4: '#14b8a6',
        accent: '#f472b6',
        blobs: ['rgba(124,58,237,0.70)', 'rgba(34,211,238,0.60)', 'rgba(217,70,239,0.55)', 'rgba(20,184,166,0.55)', 'rgba(244,114,182,0.50)'],
    },
    sunset: {
        label: 'Sunset',
        c1: '#f97316', c2: '#f43f5e', c3: '#d946ef', c4: '#7c3aed',
        accent: '#fbbf24',
        blobs: ['rgba(249,115,22,0.65)', 'rgba(244,63,94,0.55)', 'rgba(217,70,239,0.55)', 'rgba(124,58,237,0.55)', 'rgba(251,191,36,0.45)'],
    },
    ocean: {
        label: 'Ocean',
        c1: '#1e40af', c2: '#3b82f6', c3: '#06b6d4', c4: '#22d3ee',
        accent: '#67e8f9',
        blobs: ['rgba(30,64,175,0.70)', 'rgba(59,130,246,0.55)', 'rgba(6,182,212,0.55)', 'rgba(34,211,238,0.50)', 'rgba(103,232,249,0.40)'],
    },
    forest: {
        label: 'Forest',
        c1: '#15803d', c2: '#10b981', c3: '#22d3ee', c4: '#0ea5e9',
        accent: '#bef264',
        blobs: ['rgba(21,128,61,0.65)', 'rgba(16,185,129,0.55)', 'rgba(34,211,238,0.50)', 'rgba(14,165,233,0.55)', 'rgba(190,242,100,0.40)'],
    },
    nebula: {
        label: 'Nebula',
        c1: '#a855f7', c2: '#d946ef', c3: '#6366f1', c4: '#3b82f6',
        accent: '#f0abfc',
        blobs: ['rgba(168,85,247,0.70)', 'rgba(217,70,239,0.55)', 'rgba(99,102,241,0.55)', 'rgba(59,130,246,0.55)', 'rgba(240,171,252,0.45)'],
    },
    ember: {
        label: 'Ember',
        c1: '#b91c1c', c2: '#ea580c', c3: '#f59e0b', c4: '#fbbf24',
        accent: '#fda4af',
        blobs: ['rgba(185,28,28,0.65)', 'rgba(234,88,12,0.55)', 'rgba(245,158,11,0.50)', 'rgba(251,191,36,0.45)', 'rgba(253,164,175,0.40)'],
    },
};

export const DEFAULT_PALETTE = 'aurora';

export function applyPalette(name) {
    const palette = PALETTES[name] || PALETTES[DEFAULT_PALETTE];
    const root = document.documentElement;

    root.style.setProperty('--aurora-c1', palette.c1);
    root.style.setProperty('--aurora-c2', palette.c2);
    root.style.setProperty('--aurora-c3', palette.c3);
    root.style.setProperty('--aurora-c4', palette.c4);
    root.style.setProperty('--aurora-accent', palette.accent);

    palette.blobs.forEach((color, i) => {
        root.style.setProperty(`--aurora-blob-${i + 1}`, color);
    });

    root.dataset.auroraPalette = name in PALETTES ? name : DEFAULT_PALETTE;
}

export function loadStoredPalette() {
    try {
        const stored = localStorage.getItem('aurora-theme.palette');
        if (stored && stored in PALETTES) return stored;
    } catch (e) {
        // localStorage may be blocked (private mode, etc.) — fall through.
    }
    return DEFAULT_PALETTE;
}

export function storePalette(name) {
    try {
        localStorage.setItem('aurora-theme.palette', name);
    } catch (e) {
        // Ignore — palette will simply not persist.
    }
}
