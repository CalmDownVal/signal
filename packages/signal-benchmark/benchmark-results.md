# Signal Benchmark Results

This run has been generated with NodeJS v19.5.0 on Darwin 22.2.0 (arm64).

## New Instance Creation

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 154 679 451 ops/sec ±0.21% (99 samples) | - |
| 2 | EventEmitter | 46 008 998 ops/sec ±0.53% (97 samples) | 70.26% slower |
| 3 | Signal (set backend) | 32 378 003 ops/sec ±0.27% (99 samples) | 79.07% slower |

## Dispatch to 100 Handlers

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 2 196 162 ops/sec ±0.22% (100 samples) | - |
| 2 | Signal (set backend) | 2 167 522 ops/sec ±1.29% (94 samples) | 1.30% slower |
| 3 | EventEmitter | 1 985 616 ops/sec ±0.12% (97 samples) | 9.59% slower |

## Add 100 Handlers, Then Reset

This is a somewhat unfair comparison for the Set backend, as it has additional
logic to only allow unique handlers.

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 1 439 628 ops/sec ±0.17% (101 samples) | - |
| 2 | EventEmitter | 684 010 ops/sec ±0.15% (101 samples) | 52.49% slower |
| 3 | Signal (set backend) | 219 623 ops/sec ±5.53% (73 samples) | 84.74% slower |

## Removing With 100 Other Handlers Attached

This test first adds 100 unique handlers to a Signal instance and then attempts
to remove a handler that has not been added. We are therefore measuring the
worst-case performance of the handler lookup.

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (set backend) | 111 357 394 ops/sec ±0.09% (98 samples) | - |
| 2 | Signal (array backend) | 9 374 857 ops/sec ±0.30% (95 samples) | 91.58% slower |
| 3 | EventEmitter | 8 885 295 ops/sec ±0.15% (101 samples) | 92.02% slower |
