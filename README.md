# TTWorldCup

Tractors Together World Cup Sweepstake.

## Shared score persistence

The single-page app reads scores from `window.SCORE_API_URL` when defined, or `/api/scores` by default. Browser `localStorage` is only used as a cache/fallback when the shared API is unavailable.

This repo includes a Vercel Edge Function at `api/scores.js` that stores the latest score object in Upstash Redis via its REST API.

Configure these environment variables on the hosting provider:

- `UPSTASH_REDIS_REST_URL` — Upstash Redis REST endpoint.
- `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis REST token.
- `SCORE_WRITE_TOKEN` — private token admins enter in the browser before save, import, or reset writes are accepted.
- `SCORE_KEY` — optional Redis key override; defaults to `ttworldcup:scores`.
- `SCORE_ALLOWED_ORIGIN` — optional CORS origin override; defaults to `*`.

If the static site is hosted somewhere else, point the page to another compatible endpoint before the app script runs:

```html
<script>window.SCORE_API_URL = "https://example.com/api/scores";</script>
```

The endpoint contract is:

- `GET /api/scores` returns `{ "scores": {}, "updatedAt": "..." }` and is public/read-only.
- `PUT /api/scores` accepts `{ "scores": {} }` and requires `Authorization: Bearer <SCORE_WRITE_TOKEN>`.
- `DELETE /api/scores` resets scores to `{}` and requires the same bearer token.
