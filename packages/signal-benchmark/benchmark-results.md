# Signal Benchmark Results

This run has been generated with NodeJS v19.5.0 on Darwin 22.5.0, Apple M1 Max, arm64.

## New Instance Creation

This test simply creates a new instance of EventEmitter or Signal with no
additional logic

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 148 021 163 ops/sec ±1.46% (99 samples) | - |
| 2 | EventEmitter | 45 090 472 ops/sec ±1.57% (96 samples) | 69.54% slower |
| 3 | Signal (set backend) | 19 098 441 ops/sec ±0.18% (98 samples) | 87.10% slower |

## Dispatch to 100 Handlers

This test dispatches an event object to an EventEmitter or Signal with 100
handlers.

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 1 997 596 ops/sec ±0.28% (98 samples) | - |
| 2 | Signal (set backend) | 1 946 071 ops/sec ±0.27% (97 samples) | 2.58% slower |
| 3 | EventEmitter | 1 804 494 ops/sec ±0.59% (100 samples) | 9.67% slower |

## Add 100 Handlers, Then Remove All

This test adds 100 unique handlers and then removes them all using the
`removeAllListeners` or `off` methods for EventEmitter or Signal instances
respectively.

For the Set backend, this is a somewhat unfair comparison, as it has additional
logic to ensure handler uniqueness.

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 1 269 621 ops/sec ±2.30% (94 samples) | - |
| 2 | EventEmitter | 544 519 ops/sec ±0.53% (94 samples) | 57.11% slower |
| 3 | Signal (set backend) | 168 956 ops/sec ±0.68% (93 samples) | 86.69% slower |

## Removing With 100 Other Handlers Attached

This test first adds 100 unique handlers to a Signal instance and then attempts
to remove a handler that has not been added. We are therefore measuring the
worst-case performance of the handler lookup.

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (set backend) | 104 663 634 ops/sec ±0.18% (96 samples) | - |
| 2 | EventEmitter | 9 436 236 ops/sec ±0.26% (99 samples) | 90.98% slower |
| 3 | Signal (array backend) | 9 134 404 ops/sec ±0.35% (94 samples) | 91.27% slower |
