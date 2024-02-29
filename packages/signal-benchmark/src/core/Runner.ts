/* eslint-disable import/no-named-as-default-member */
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMainThread, parentPort, Worker } from 'node:worker_threads';

import Benchmark from 'benchmark';

import type { BenchmarkResult, BenchmarkTestCaseResult } from '~/core/types';
import { post, receive } from '~/core/utils/messaging';
import { noOp } from '~/core/utils/misc';

export interface TestCase {
	readonly name: string;
	readonly init?: () => any;
	readonly test: (initResult?: any) => void;
}

export interface BenchmarkSetup {
	readonly title: string;
	readonly comment: string;
	readonly testCases: readonly TestCase[];
}


export interface BenchmarkStartMessage {
	readonly kind: 'start';
	readonly params?: any;
}

export type MainToWorkerMessage =
	| BenchmarkStartMessage;


export interface BenchmarkBeginMessage {
	readonly kind: 'begin';
	readonly title: string;
}

export interface BenchmarkCompletedMessage {
	readonly kind: 'completed';
	readonly result: BenchmarkResult;
}

export type WorkerToMainMessage =
	| BenchmarkBeginMessage
	| BenchmarkCompletedMessage;


export class Runner {
	public runTask(name: string, params?: any) {
		return () => this.run(name, params);
	}

	public run(name: string, params?: any) {
		if (!isMainThread) {
			return Promise.reject(new Error('Benchmarks can only be run from the main thread.'));
		}

		return new Promise<BenchmarkResult>((resolve, reject) => {
			const worker = new Worker(join(Runner.BUILD_DIR, `./${name}.mjs`));
			worker.on('message', (message: WorkerToMainMessage) => {
				switch (message.kind) {
					case 'begin':
						// eslint-disable-next-line no-console
						console.log(`Started '${message.title}'.`);
						break;

					case 'completed':
						// eslint-disable-next-line no-console
						console.log(`Completed '${message.result.title}'!`);
						worker
							.terminate()
							.then(noOp, noOp)
							.finally(() => {
								resolve(message.result);
							});

						break;
				}
			});

			worker.on('error', ex => {
				reject(new Error('Worker failed.', { cause: ex }));
			});

			post<MainToWorkerMessage>(worker, {
				kind: 'start',
				params
			});
		});
	}

	public static readonly BUILD_DIR = resolvePath(dirname(fileURLToPath(import.meta.url)), '../build');

	public static async benchmark<T = unknown>(block: (params: T) => BenchmarkSetup) {
		if (isMainThread) {
			return Promise.reject(new Error('Benchmarks runners can only be created from within a worker thread.'));
		}

		const init = await receive<MainToWorkerMessage>(parentPort!);
		const setup = block(init.params as T);
		const suite = new Benchmark.Suite(setup.title, {
			initCount: 50,

			// times are in seconds
			delay: 3,
			minTime: 5,
			maxTime: 20
		});

		for (const testCase of setup.testCases) {
			const initResult = testCase.init?.();
			suite.add(testCase.name, testCase.test.bind(null, initResult));
		}

		return new Promise<void>((resolve, reject) => {
			post<WorkerToMainMessage>(parentPort!, {
				kind: 'begin',
				title: setup.title
			});

			const testCases: BenchmarkTestCaseResult[] = [];
			suite
				.on('error', (ex: unknown) => {
					reject(new Error('The benchmark failed.', { cause: ex }));
				})
				.on('cycle', (e: Benchmark.Event) => {
					global.gc?.();
					testCases.push({
						name: e.target.name!,
						errorMargin: e.target.stats!.rme,
						opsPerSecond: e.target.hz!,
						sampleCount: e.target.stats!.sample.length
					});
				})
				.on('complete', () => {
					post<WorkerToMainMessage>(parentPort!, {
						kind: 'completed',
						result: {
							title: setup.title,
							comment: setup.comment,
							testCases
						}
					});

					resolve();
				})
				.run();
		});
	}
}
