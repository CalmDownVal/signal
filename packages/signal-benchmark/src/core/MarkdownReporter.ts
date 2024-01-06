import { createWriteStream, type WriteStream } from 'node:fs';
import * as OS from 'node:os';
import { resolve as resolvePath } from 'node:path';

import type { BenchmarkReporter, BenchmarkResult } from './types';
import { formatLargeInt, formatPercentage } from './utils/format';

export class MarkdownReporter implements BenchmarkReporter {
	private constructor(
		private readonly stream: WriteStream
	) {}

	public close() {
		return new Promise<void>((resolve, reject) => {
			this.stream.close(ex => {
				if (ex) {
					reject(new Error('Failed to close stream.', { cause: ex }));
				}
				else {
					resolve();
				}
			});
		});
	}

	public report(result: BenchmarkResult) {
		this.stream.write(`
## ${result.title}

${result.comment}

| Rank | Test Case | Observation | Relative Speed |
|------|-----------|-------------|----------------|
`);

		const testCases = result.testCases.slice().sort((a, b) => b.opsPerSecond - a.opsPerSecond);
		const bestHz = testCases[0].opsPerSecond;

		for (let i = 0; i < testCases.length; ++i) {
			const testCase = testCases[i];
			this.stream.write(`\
| ${i + 1} \
| ${testCase.name} \
| ${formatLargeInt(testCase.opsPerSecond)} ops/sec ±${formatPercentage(testCase.errorMargin)} (${testCase.sampleCount} samples) \
| ${i > 0 ? `${formatPercentage(100 * (1 - testCase.opsPerSecond / bestHz))} slower` : '-'} |
`);
		}
	}

	public static create(path: string) {
		return new Promise<MarkdownReporter>((resolve, reject) => {
			const absPath = resolvePath(path);
			const stream = createWriteStream(absPath, {
				encoding: 'utf8'
			});

			const onStreamError = (ex: unknown) => {
				reject(new Error(`Failed to create a Reporter for '${absPath}'`, { cause: ex }));
			};

			const onFirstWrite = () => {
				stream.off('error', onStreamError);
				resolve(new MarkdownReporter(stream));
			};

			stream.once('error', onStreamError);
			stream.write(`\
# Signal Benchmark Results

This run has been generated with NodeJS ${process.version} (V8: ${process.versions.v8}) on ${OS.type()} ${OS.release()}, ${OS.cpus()[0].model}, ${OS.arch()}.
`, onFirstWrite);
		});
	}
}
