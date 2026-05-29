# TTWorldCup

Tractors Together World Cup Sweepstake

## Maintainer note: final draw updates

Use slot numbers as the source of truth when sending or applying final draw allocation updates. Country names, entrant names, and payment statuses are included as update data for the allocation row.

Preferred format:

```csv
slot,entrant,country,paid
1,Lance B,Haiti,No
2,Nick Singleton,Korea Republic,No
3,Tom I,Uruguay,No
```

If payment status is managed elsewhere, the `paid` column is optional. Treat missing `paid` values as `No` when applying the update.

When applying a final draw update:

1. Replace the relevant entries in `APP_DATA.draw` in `index.html`.
2. Preserve each country’s ranking and confederation from `APP_DATA.rankings`.
3. Ensure every allocated country exists in `APP_DATA.rankings`.
4. Ensure there are 48 allocation rows.
5. Ensure every country appears only once.
6. Ensure every slot number is unique.
7. Re-render entrants and prize-board calculations from the updated draw data.

## Maintainer note: results updates

Use fixture IDs as the source of truth when sending or applying score updates. Team names are included only as a human-readable check against the fixture list.

Preferred format:

```text
RESULTS UPDATE

Fixture ID: Home Team home_score-away_score Away Team
```

Example:

```text
Fixture 17: France 2-0 Senegal
```

Correction format:

```text
CORRECTION

Fixture 17 should be France 1-1 Senegal, not 2-0.
```
