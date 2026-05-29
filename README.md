# TTWorldCup

Tractors Together World Cup Sweepstake

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
