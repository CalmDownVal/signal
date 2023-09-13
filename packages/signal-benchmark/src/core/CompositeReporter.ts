import type { BenchmarkReporter, BenchmarkResult } from '~/core/types';

export class CompositeReporter implements BenchmarkReporter {
	public constructor(
		private readonly reporters: readonly BenchmarkReporter[]
	) {}

	public async close() {
		await Promise.all(
			this.reporters.map(reporter => reporter.close())
		);
	}

	public report(result: BenchmarkResult) {
		this.reporters.forEach(reporter => {
			reporter.report(result);
		});
	}
}
