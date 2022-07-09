# Signal Benchmark Results

This run has been generated with NodeJS v18.5.0 on Darwin 21.1.0 (arm64).

## New Instance Creation

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 83 371 581 ops/sec ±0.48% (91 samples) | - |
| 2 | EventEmitter | 61 100 364 ops/sec ±1.21% (84 samples) | 26.71% slower |
| 3 | Signal (set backend) | 25 950 658 ops/sec ±0.19% (101 samples) | 68.87% slower |

## Dispatch to 100 Handlers

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (set backend) | 2 087 957 ops/sec ±0.32% (98 samples) | - |
| 2 | Signal (array backend) | 2 059 210 ops/sec ±0.42% (95 samples) | 1.38% slower |
| 3 | EventEmitter | 1 899 944 ops/sec ±0.22% (100 samples) | 9.00% slower |

## Add 100 Handlers, Then Reset

This is a somewhat unfair comparison for the Set backend, as it has additional
logic to only allow unique handlers.

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 1 338 235 ops/sec ±0.14% (100 samples) | - |
| 2 | EventEmitter | 694 673 ops/sec ±0.15% (97 samples) | 48.09% slower |
| 3 | Signal (set backend) | 305 213 ops/sec ±2.72% (83 samples) | 77.19% slower |

## Removing With 100 Other Handlers Attached

This test first adds 100 unique handlers to a Signal instance and then attempts
to remove a handler that has not been added. We are therefore measuring the
worst-case performance of the handler lookup.

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (set backend) | 110 688 030 ops/sec ±0.14% (100 samples) | - |
| 2 | EventEmitter | 9 586 375 ops/sec ±0.33% (98 samples) | 91.34% slower |
| 3 | Signal (array backend) | 9 327 234 ops/sec ±0.08% (97 samples) | 91.57% slower |
