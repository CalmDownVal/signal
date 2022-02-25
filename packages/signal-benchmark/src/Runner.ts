/* eslint-disable import/no-named-as-default-member */
import Benchmark from 'benchmark';

import type { Reporter } from './Reporter';

export interface TestCase {
	readonly name: string;
	readonly init?: () => any;
	readonly test: (initResult?: any) => void;
}

export interface BenchmarkSetup {
	readonly title: string;
	readonly comment?: string;
	readonly testCases: readonly TestCase[];
}

export class Runner {
	public constructor(
		private readonly reporter: Reporter
	) {}

	public benchmark(setup: BenchmarkSetup) {
		const suite = new Benchmark.Suite(setup.title, {
			initCount: 100,

			// times are in seconds
			delay: 3,
			minTime: 5,
			maxTime: 10
		});

		for (const testCase of setup.testCases) {
			const initResult = testCase.init?.();
			suite.add(testCase.name, testCase.test.bind(null, initResult));
		}

		return new Promise<void>(resolve => {
			this.reporter.onBenchmarkBegin(setup.title, setup.comment);
			suite
				.on('cycle', (e: Benchmark.Event) => {
					this.reporter.onResult(e.target);
					global.gc?.();
				})
				.on('complete', () => {
					this.reporter.onBenchmarkEnd();
					resolve();
				})
				.run({ async: true });
		});
	}
}
