import { createWriteStream, WriteStream } from 'fs';
import * as OS from 'os';
import { resolve } from 'path';

function formatLargeInt(n: number) {
	let str = Math.round(n).toString();
	for (let i = str.length - 3; i > 0; i -= 3) {
		str = str.slice(0, i) + ' ' + str.slice(i);
	}

	return str;
}

export class Reporter {
	private readonly stream: WriteStream;
	private currentGroup: any[] = [];

	public constructor(path: string) {
		const absPath = resolve(path);
		console.info(`Writing benchmark results into: ${absPath}`);

		this.stream = createWriteStream(absPath, {
			encoding: 'utf8'
		});

		this.stream.write(`\
# Signal Benchmark Results

This run has been generated with NodeJS ${process.version} on ${OS.type()} ${OS.release()} (${OS.arch()}).
`);
	}

	public close() {
		this.stream.close();
	}

	public onBenchmarkBegin(name: string) {
		console.group(name);
		this.stream.write(`
## ${name}

| Rank | Test Case | Observation |
|------|-----------|-------------|
`);
	}

	public onResult(result: any) {
		console.info(result.toString());
		this.currentGroup.push(result);
	}

	public onBenchmarkEnd() {
		console.groupEnd();

		this.currentGroup.sort((a, b) => b.hz - a.hz);
		for (let index = 0; index < this.currentGroup.length; ++index) {
			const result = this.currentGroup[index];
			this.stream.write(`\
| ${index + 1} \
| ${result.name} \
| ${formatLargeInt(result.hz)} ops/sec ±${result.stats.rme.toFixed(2)} (${result.stats.sample.length} samples) |
`);
		}

		this.currentGroup = [];
	}
}
