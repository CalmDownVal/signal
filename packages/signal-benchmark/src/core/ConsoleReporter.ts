import type { BenchmarkReporter, BenchmarkResult } from '~/core/types';
import { formatLargeInt, formatPercentage } from '~/core/utils/format';

export class ConsoleReporter implements BenchmarkReporter {
	public close() {
		return Promise.resolve();
	}

	public report(result: BenchmarkResult) {
		/* eslint-disable no-console */
		console.group(result.title);
		for (const testCase of result.testCases) {
			console.info(`- ${testCase.name}: ${formatLargeInt(testCase.opsPerSecond)} ops/sec ±${formatPercentage(testCase.errorMargin)} (${testCase.sampleCount} samples)`);
		}

		console.groupEnd();
		/* eslint-enable */
	}
}
