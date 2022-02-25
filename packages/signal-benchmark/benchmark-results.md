# Signal Benchmark Results

This run has been generated with NodeJS v17.5.0 on Darwin 21.1.0 (arm64).

## New Instance Creation

| Rank | Test Case | Observation |
|------|-----------|-------------|
| 1 | Signal (array backend) | 81 595 729 ops/sec ±0.31 (95 samples) |
| 2 | EventEmitter | 58 978 229 ops/sec ±0.69 (94 samples) |
| 3 | Signal (set backend) | 25 188 063 ops/sec ±0.42 (97 samples) |

## Dispatch to 100 Handlers

| Rank | Test Case | Observation |
|------|-----------|-------------|
| 1 | Signal (array backend) | 1 989 368 ops/sec ±0.23 (97 samples) |
| 2 | Signal (set backend) | 1 966 119 ops/sec ±0.21 (98 samples) |
| 3 | EventEmitter | 1 807 973 ops/sec ±0.10 (100 samples) |

## Add 100 Handlers, Then Reset

| Rank | Test Case | Observation |
|------|-----------|-------------|
| 1 | Signal (array backend) | 1 401 283 ops/sec ±0.17 (101 samples) |
| 2 | EventEmitter | 705 961 ops/sec ±0.14 (102 samples) |
| 3 | Signal (set backend) | 292 338 ops/sec ±2.76 (83 samples) |

## Removing With 100 Other Handlers Attached

| Rank | Test Case | Observation |
|------|-----------|-------------|
| 1 | Signal (set backend) | 110 358 360 ops/sec ±0.05 (99 samples) |
| 2 | Signal (array backend) | 10 045 399 ops/sec ±0.27 (99 samples) |
| 3 | EventEmitter | 9 745 959 ops/sec ±0.08 (100 samples) |
