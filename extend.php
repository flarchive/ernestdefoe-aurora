<?php

/*
 * This file is part of ernestdefoe/aurora.
 *
 * Copyright (c) Ernest Defoe.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\AuroraTheme;

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->css(__DIR__ . '/less/forum.less')
        ->js(__DIR__ . '/js/dist/forum.js'),

    (new Extend\Frontend('admin'))
        ->css(__DIR__ . '/less/admin.less')
        ->js(__DIR__ . '/js/dist/admin.js'),

    new Extend\Locales(__DIR__ . '/resources/locale'),

    (new Extend\Settings())
        ->default('aurora-theme.primary_gradient_start', '#7c3aed')
        ->default('aurora-theme.primary_gradient_end', '#22d3ee')
        ->default('aurora-theme.accent_color', '#f472b6')
        ->default('aurora-theme.enable_glassmorphism', true)
        ->default('aurora-theme.enable_glow', true)
        ->default('aurora-theme.animate_background', true)
        // Expose settings to the forum frontend so app.forum.attribute() returns them.
        ->serializeToForum('aurora-theme.primary_gradient_start', 'aurora-theme.primary_gradient_start')
        ->serializeToForum('aurora-theme.primary_gradient_end', 'aurora-theme.primary_gradient_end')
        ->serializeToForum('aurora-theme.accent_color', 'aurora-theme.accent_color')
        ->serializeToForum('aurora-theme.enable_glassmorphism', 'aurora-theme.enable_glassmorphism', 'boolval')
        ->serializeToForum('aurora-theme.enable_glow', 'aurora-theme.enable_glow', 'boolval')
        ->serializeToForum('aurora-theme.animate_background', 'aurora-theme.animate_background', 'boolval'),
];
