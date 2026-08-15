import app from 'flarum/admin/app';

app.initializers.add('ernestdefoe/aurora', () => {
    app.extensionData
        .for('ernestdefoe-aurora')
        .registerSetting({
            setting: 'aurora-theme.primary_gradient_start',
            label: app.translator.trans('ernestdefoe-aurora.admin.settings.gradient_start'),
            type: 'color',
        })
        .registerSetting({
            setting: 'aurora-theme.primary_gradient_end',
            label: app.translator.trans('ernestdefoe-aurora.admin.settings.gradient_end'),
            type: 'color',
        })
        .registerSetting({
            setting: 'aurora-theme.accent_color',
            label: app.translator.trans('ernestdefoe-aurora.admin.settings.accent_color'),
            type: 'color',
        })
        .registerSetting({
            setting: 'aurora-theme.enable_glassmorphism',
            label: app.translator.trans('ernestdefoe-aurora.admin.settings.glassmorphism'),
            type: 'boolean',
        })
        .registerSetting({
            setting: 'aurora-theme.enable_glow',
            label: app.translator.trans('ernestdefoe-aurora.admin.settings.glow'),
            type: 'boolean',
        })
        .registerSetting({
            setting: 'aurora-theme.animate_background',
            label: app.translator.trans('ernestdefoe-aurora.admin.settings.animate_background'),
            type: 'boolean',
        });
});
