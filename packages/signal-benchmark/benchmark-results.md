# Signal Benchmark Results

This run has been generated with NodeJS v17.5.0 on Darwin 21.1.0 (arm64).

## New Instance Creation

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 80 966 375 ops/sec ±0.44% (93 samples) | - |
| 2 | EventEmitter | 58 969 875 ops/sec ±0.78% (92 samples) | 27.17% slower |
| 3 | Signal (set backend) | 24 828 417 ops/sec ±0.31% (100 samples) | 69.33% slower |

## Dispatch to 100 Handlers

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 2 002 339 ops/sec ±0.08% (100 samples) | - |
| 2 | Signal (set backend) | 1 988 142 ops/sec ±0.10% (97 samples) | 0.71% slower |
| 3 | EventEmitter | 1 804 249 ops/sec ±0.14% (96 samples) | 9.89% slower |

## Add 100 Handlers, Then Reset

This is a somewhat unfair comparison for the Set backend, as it has additional
logic to only allow unique handlers.

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 1 398 549 ops/sec ±0.16% (93 samples) | - |
| 2 | EventEmitter | 705 911 ops/sec ±0.20% (102 samples) | 49.53% slower |
| 3 | Signal (set backend) | 285 572 ops/sec ±2.48% (81 samples) | 79.58% slower |

## Removing With 100 Other Handlers Attached

This test first adds 100 unique handlers to a Signal instance and then attempts
to remove a handler that has not been added. We are therefore measuring the
worst-case performance of the handler lookup.

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (set backend) | 110 487 125 ops/sec ±0.07% (98 samples) | - |
| 2 | Signal (array backend) | 9 040 595 ops/sec ±2.13% (91 samples) | 91.82% slower |
| 3 | EventEmitter | 7 871 853 ops/sec ±0.93% (97 samples) | 92.88% slower |
