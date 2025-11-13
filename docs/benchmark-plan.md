# Adaptive AI Benchmark Plan

We’re using the upgraded self-play harness (`npm run bench:selfplay`) to compare Normal, Hard, and Expert difficulties with adaptive logic toggled **off** vs **on**. Each run writes raw JSON to `bench/results/run-*.json`; older artifacts now live in `bench/archive/results-pre-telemetry/`.

## Normal Difficulty (Battle ruleset)

| Scenario | Command |
| --- | --- |
| Baseline | `npm run bench:selfplay -- --games 50 --matchup normal-vs-normal --ruleset battle --adaptive off` |
| Adaptive (flow band) | `npm run bench:selfplay -- --games 50 --matchup normal-vs-normal --ruleset battle --adaptive on --band flow` |

## Hard Difficulty

| Scenario | Command |
| --- | --- |
| Baseline | `npm run bench:selfplay -- --games 50 --matchup hard-vs-hard --ruleset battle --adaptive off` |
| Adaptive (flow band) | `npm run bench:selfplay -- --games 50 --matchup hard-vs-hard --ruleset battle --adaptive on --band flow` |

## Expert vs Hard

| Scenario | Command |
| --- | --- |
| Baseline | `npm run bench:selfplay -- --games 50 --matchup expert-vs-hard --ruleset battle --adaptive off` |
| Adaptive (flow band) | `npm run bench:selfplay -- --games 50 --matchup expert-vs-hard --ruleset battle --adaptive on --band flow` |

### Notes

- Swap `--ruleset battle` for `modern` or `classic` to sample other rules.
- Use `--band struggle` or `--band coast` to stress-test extremes once flow baselines are logged.
- Keep `--games` modest (≈50) for quick iteration; spike to 200+ only when finalizing release notes.
