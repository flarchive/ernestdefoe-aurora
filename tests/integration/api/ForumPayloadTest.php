<?php

namespace ErnestDefoe\AuroraTheme\Tests\integration\api;

use Carbon\Carbon;
use Flarum\Discussion\Discussion;
use Flarum\Post\Post;
use Flarum\Testing\integration\RetrievesAuthorizedUsers;
use Flarum\Testing\integration\TestCase;
use Flarum\User\User;
use PHPUnit\Framework\Attributes\Test;

/** The theme's settings and hero statistics, as every visitor's page receives them. */
class ForumPayloadTest extends TestCase
{
    use RetrievesAuthorizedUsers;

    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('ernestdefoe-aurora');

        $this->prepareDatabase([
            User::class => [
                // Seen just now; the admin (1) was seen long ago.
                $this->normalUser() + ['last_seen_at' => Carbon::now()],
                ['id' => 3, 'username' => 'unconfirmed', 'email' => 'u@machine.local', 'is_email_confirmed' => 0, 'last_seen_at' => Carbon::now()->subHour()],
            ],
            Discussion::class => [
                ['id' => 1, 'title' => 'Open', 'created_at' => Carbon::now(), 'user_id' => 2, 'first_post_id' => 1, 'comment_count' => 2],
                ['id' => 2, 'title' => 'Hidden', 'created_at' => Carbon::now(), 'user_id' => 2, 'first_post_id' => 3, 'comment_count' => 1, 'hidden_at' => Carbon::now()],
                ['id' => 3, 'title' => 'Private', 'created_at' => Carbon::now(), 'user_id' => 2, 'first_post_id' => 4, 'comment_count' => 1, 'is_private' => true],
            ],
            Post::class => [
                ['id' => 1, 'discussion_id' => 1, 'number' => 1, 'created_at' => Carbon::now(), 'user_id' => 2, 'type' => 'comment', 'content' => '<t>a</t>'],
                ['id' => 2, 'discussion_id' => 1, 'number' => 2, 'created_at' => Carbon::now(), 'user_id' => 2, 'type' => 'comment', 'content' => '<t>b</t>', 'hidden_at' => Carbon::now()],
                ['id' => 5, 'discussion_id' => 1, 'number' => 3, 'created_at' => Carbon::now(), 'user_id' => 2, 'type' => 'discussionRenamed', 'content' => '["a","b"]'],
                ['id' => 3, 'discussion_id' => 2, 'number' => 1, 'created_at' => Carbon::now(), 'user_id' => 2, 'type' => 'comment', 'content' => '<t>c</t>'],
            ],
        ]);
    }

    private function forum(): array
    {
        $response = $this->send($this->request('GET', '/api'));
        $this->assertSame(200, $response->getStatusCode());

        return json_decode((string) $response->getBody(), true)['data']['attributes'];
    }

    #[Test]
    public function the_theme_settings_arrive_with_their_defaults()
    {
        $forum = $this->forum();

        $this->assertSame('#7c3aed', $forum['aurora-theme.primary_gradient_start']);
        $this->assertSame('#22d3ee', $forum['aurora-theme.primary_gradient_end']);
        $this->assertSame('#f472b6', $forum['aurora-theme.accent_color']);
        $this->assertTrue($forum['aurora-theme.enable_glassmorphism']);
        $this->assertTrue($forum['aurora-theme.enable_glow']);
        $this->assertTrue($forum['aurora-theme.animate_background']);
    }

    #[Test]
    public function switched_off_effects_arrive_as_false()
    {
        $this->setting('aurora-theme.enable_glassmorphism', '0');
        $this->setting('aurora-theme.enable_glow', '');
        $this->setting('aurora-theme.accent_color', '#000000');

        $forum = $this->forum();

        $this->assertFalse($forum['aurora-theme.enable_glassmorphism']);
        $this->assertFalse($forum['aurora-theme.enable_glow']);
        $this->assertSame('#000000', $forum['aurora-theme.accent_color']);
    }

    #[Test]
    public function the_hero_counts_are_real_and_only_count_what_is_public()
    {
        $this->assertSame([
            'users' => 2,       // the admin and the member; not the unconfirmed account
            'discussions' => 1, // not the hidden or the private one
            'posts' => 2,       // visible comments only; post 2 is hidden, post 5 is an event
            'online' => 1,      // seen in the last five minutes
        ], $this->forum()['auroraStats']);
    }

    #[Test]
    public function the_hero_counts_are_cached_for_a_minute()
    {
        $this->assertSame(1, $this->forum()['auroraStats']['discussions']);

        $this->database()->table('discussions')->insert(['id' => 9, 'title' => 'New', 'slug' => 'new', 'created_at' => Carbon::now(), 'user_id' => 2, 'comment_count' => 0, 'participant_count' => 0]);

        $this->assertSame(1, $this->forum()['auroraStats']['discussions'], 'Recounted at most once a minute');
    }
}
