import Extend from 'flarum/common/extenders';
import app from 'flarum/admin/app';

const t = (key) => app.translator.trans(`ernestdefoe-aurora.admin.settings.${key}`, {}, true);

export default [
    new Extend.Admin()
        .setting(() => ({
            setting: 'aurora-theme.primary_gradient_start',
            label: t('gradient_start'),
            type: 'color-preview',
        }))
        .setting(() => ({
            setting: 'aurora-theme.primary_gradient_end',
            label: t('gradient_end'),
            type: 'color-preview',
        }))
        .setting(() => ({
            setting: 'aurora-theme.accent_color',
            label: t('accent_color'),
            type: 'color-preview',
        }))
        .setting(() => ({
            setting: 'aurora-theme.enable_glassmorphism',
            label: t('glassmorphism'),
            type: 'boolean',
        }))
        .setting(() => ({
            setting: 'aurora-theme.enable_glow',
            label: t('glow'),
            type: 'boolean',
        }))
        .setting(() => ({
            setting: 'aurora-theme.animate_background',
            label: t('animate_background'),
            type: 'boolean',
        })),
];
