<?php

namespace ErnestDefoe\AuroraTheme\Forum;

use Carbon\Carbon;
use Flarum\Discussion\Discussion;
use Flarum\Post\Post;
use Flarum\User\User;
use Illuminate\Contracts\Cache\Repository as Cache;

/**
 * Snapshot of public, hero-widget-friendly forum counts.
 *
 * Exposed to the frontend through a single `auroraStats` field on
 * Flarum's ForumResource (see extend.php). Cached for 60s so the
 * four COUNT(*) aggregates run at most once per minute per process —
 * a tiny price for hero tiles that show real numbers instead of the
 * hardcoded placeholders the audit flagged.
 *
 * "Online" is defined as "last_seen_at within the last 5 minutes",
 * which is the same window flarum-statistics uses. Flarum core
 * doesn't ship an aggregate field for this; we compute it.
 */
class AuroraStats
{
    private const CACHE_KEY     = 'aurora-theme.stats';
    private const TTL_SECONDS   = 60;
    private const ONLINE_WINDOW = 5;

    public function __construct(private Cache $cache)
    {
    }

    /**
     * @return array{users:int,discussions:int,posts:int,online:int}
     */
    public function snapshot(): array
    {
        return $this->cache->remember(
            self::CACHE_KEY,
            self::TTL_SECONDS,
            fn () => $this->compute()
        );
    }

    /**
     * @return array{users:int,discussions:int,posts:int,online:int}
     */
    private function compute(): array
    {
        // Users: registered accounts that confirmed their email. Skips
        // bot signups + unconfirmed-and-deleted accounts.
        $users = (int) User::query()
            ->where('is_email_confirmed', true)
            ->count();

        // Online: last_seen_at within the configured window. Same
        // semantics flarum-statistics uses for its "online" series.
        $online = (int) User::query()
            ->where('last_seen_at', '>=', Carbon::now()->subMinutes(self::ONLINE_WINDOW))
            ->count();

        // Discussions: visible (not hidden, not private). Matches what
        // a guest sees in the default discussion list, so the hero
        // tile and the list view agree.
        $discussions = (int) Discussion::query()
            ->whereNull('hidden_at')
            ->where('is_private', false)
            ->count();

        // Posts: comment-type only, visible. Filtering by type=comment
        // drops the auto-generated event posts ("X renamed the
        // discussion", "Y was assigned") which inflate raw post counts
        // by 30-60% on active forums.
        $posts = (int) Post::query()
            ->where('type', 'comment')
            ->whereNull('hidden_at')
            ->count();

        return compact('users', 'discussions', 'posts', 'online');
    }
}
