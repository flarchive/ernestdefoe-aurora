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

use ErnestDefoe\AuroraTheme\Forum\AuroraStats;
use Flarum\Api\Resource\ForumResource;
use Flarum\Api\Schema;
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
        // Expose admin settings to the forum frontend so applyThemeVariables()
        // can read them via app.forum.attribute(). The color values flow into
        // CSS custom properties (--aurora-c1/c2/accent); the booleans drive
        // the body-class toggles (aurora-no-animation/glass/glow) that the
        // matching CSS rules in less/forum.less honour.
        ->serializeToForum('aurora-theme.primary_gradient_start', 'aurora-theme.primary_gradient_start')
        ->serializeToForum('aurora-theme.primary_gradient_end', 'aurora-theme.primary_gradient_end')
        ->serializeToForum('aurora-theme.accent_color', 'aurora-theme.accent_color')
        ->serializeToForum('aurora-theme.enable_glassmorphism', 'aurora-theme.enable_glassmorphism', 'boolval')
        ->serializeToForum('aurora-theme.enable_glow', 'aurora-theme.enable_glow', 'boolval')
        ->serializeToForum('aurora-theme.animate_background', 'aurora-theme.animate_background', 'boolval'),

    // Real hero-widget stats. One Schema field returns the four counts
    // (users, discussions, posts, online-last-5min) as a single object,
    // backed by AuroraStats' 60-second cache so the underlying COUNT(*)
    // aggregates run at most once per minute per worker. Replaces the
    // hardcoded placeholder numbers (1284 / 8742 / 53901 / 142) the
    // audit flagged as misleading on freshly-installed forums.
    (new Extend\ApiResource(ForumResource::class))
        ->fields(fn () => [
            Schema\Arr::make('auroraStats')
                ->get(fn () => resolve(AuroraStats::class)->snapshot()),
        ]),
];
