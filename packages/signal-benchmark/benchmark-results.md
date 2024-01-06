# Signal Benchmark Results

This run has been generated with NodeJS v21.5.0 (V8: 11.8.172.17-node.18) on Darwin 23.1.0, Apple M1 Max, arm64.

## New Instance Creation

This test simply creates a new instance of EventEmitter or Signal with no
additional logic

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 149 621 466 ops/sec ±0.16% (96 samples) | - |
| 2 | EventEmitter | 46 623 547 ops/sec ±0.25% (99 samples) | 68.84% slower |
| 3 | Signal (set backend) | 17 142 482 ops/sec ±0.11% (95 samples) | 88.54% slower |

## Dispatch to 100 Handlers

This test dispatches an event object to an EventEmitter or Signal with 100
handlers.

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 2 027 613 ops/sec ±0.17% (96 samples) | - |
| 2 | Signal (set backend) | 2 016 970 ops/sec ±0.14% (100 samples) | 0.52% slower |
| 3 | EventEmitter | 1 814 731 ops/sec ±0.15% (98 samples) | 10.50% slower |

## Add 100 Handlers, Then Remove All

This test adds 100 unique handlers and then removes them all using the
`removeAllListeners` or `off` methods for EventEmitter or Signal instances
respectively.

For the Set backend, this is a somewhat unfair comparison, as it has additional
logic to ensure handler uniqueness.

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 2 123 021 ops/sec ±0.22% (96 samples) | - |
| 2 | EventEmitter | 531 008 ops/sec ±0.19% (96 samples) | 74.99% slower |
| 3 | Signal (set backend) | 175 694 ops/sec ±0.95% (85 samples) | 91.72% slower |

## Removing With 100 Other Handlers Attached

This test first adds 100 unique handlers to a Signal instance and then attempts
to remove a handler that has not been added. We are therefore measuring the
worst-case performance of the handler lookup.

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (set backend) | 104 774 352 ops/sec ±0.14% (96 samples) | - |
| 2 | Signal (array backend) | 9 643 496 ops/sec ±0.16% (95 samples) | 90.80% slower |
| 3 | EventEmitter | 9 391 190 ops/sec ±0.22% (97 samples) | 91.04% slower |
