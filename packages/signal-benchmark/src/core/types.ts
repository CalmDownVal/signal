export interface BenchmarkResult {
	readonly title: string;
	readonly comment: string;
	readonly testCases: readonly BenchmarkTestCaseResult[];
}

export interface BenchmarkTestCaseResult {
	readonly name: string;
	readonly errorMargin: number;
	readonly opsPerSecond: number;
	readonly sampleCount: number;
}

export interface BenchmarkReporter {
	close(): Promise<void>;
	report(result: BenchmarkResult): void;
}
