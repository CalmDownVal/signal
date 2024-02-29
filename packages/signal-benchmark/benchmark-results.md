# Signal Benchmark Results

This run has been generated with NodeJS v21.6.2 (V8: 11.8.172.17-node.19) on Darwin 23.3.0, Apple M1 Pro, arm64.

## New Instance Creation

This test simply creates a new instance of EventEmitter or Signal with no
additional logic

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 149 012 050 ops/sec ±0.12% (101 samples) | - |
| 2 | EventEmitter | 47 569 578 ops/sec ±0.15% (101 samples) | 68.08% slower |
| 3 | Signal (set backend) | 20 726 344 ops/sec ±0.13% (98 samples) | 86.09% slower |

## Dispatch to 100 Handlers

This test dispatches an event object to an EventEmitter or Signal with 100
handlers.

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 2 015 308 ops/sec ±0.13% (98 samples) | - |
| 2 | Signal (set backend) | 1 989 229 ops/sec ±0.13% (99 samples) | 1.29% slower |
| 3 | EventEmitter | 1 801 719 ops/sec ±0.10% (101 samples) | 10.60% slower |

## Add 100 Handlers, Then Remove All

This test adds 100 unique handlers and then removes them all using the
`removeAllListeners` or `off` methods for EventEmitter or Signal instances
respectively.

For the Set backend, this is a somewhat unfair comparison, as it has additional
logic to ensure handler uniqueness.

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (array backend) | 1 995 730 ops/sec ±0.18% (100 samples) | - |
| 2 | EventEmitter | 541 588 ops/sec ±0.09% (98 samples) | 72.86% slower |
| 3 | Signal (set backend) | 173 127 ops/sec ±0.98% (91 samples) | 91.33% slower |

## Removing With 100 Other Handlers Attached

This test first adds 100 unique handlers to a Signal instance and then attempts
to remove a handler that has not been added. We are therefore measuring the
worst-case performance of the handler lookup.

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
| 1 | Signal (set backend) | 104 313 045 ops/sec ±0.12% (98 samples) | - |
| 2 | Signal (array backend) | 9 599 845 ops/sec ±0.12% (99 samples) | 90.80% slower |
| 3 | EventEmitter | 9 304 319 ops/sec ±0.18% (95 samples) | 91.08% slower |
