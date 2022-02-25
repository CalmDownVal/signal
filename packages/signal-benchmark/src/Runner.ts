/* eslint-disable import/no-named-as-default-member */
import Bechmark from 'benchmark';

import type { Reporter } from './Reporter';

export interface TestCase{
	readonly name: string;
	readonly init?: () => any;
	readonly test: (initResult?: any) => void;
}

export class Runner {
	public constructor(
		private readonly reporter: Reporter
	) {}

	public benchmark(benchmarkTitle: string, testCases: readonly TestCase[]) {
		const suite = new Bechmark.Suite(benchmarkTitle, {
			initCount: 100,

			// times are in seconds
			delay: 3,
			minTime: 5,
			maxTime: 10
		});

		for (const testCase of testCases) {
			const initResult = testCase.init?.();
			suite.add(testCase.name, testCase.test.bind(null, initResult));
		}

		return new Promise<void>(resolve => {
			this.reporter.onBenchmarkBegin(benchmarkTitle);
			suite
				.on('cycle', (e: any) => {
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
