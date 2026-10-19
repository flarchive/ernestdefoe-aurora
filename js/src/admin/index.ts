// Flarum 2.x admin entrypoint. Settings are registered via the
// default-exported extender array in extend.js, which Flarum picks up
// automatically — no app.initializers.add() needed.

export { default as extend } from './extend';
