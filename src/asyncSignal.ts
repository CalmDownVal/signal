import { createBackend } from './backend';
import type { AsyncSignal, AsyncSignalOptions, Handlers } from './types';

function isPromise(obj: any): obj is Promise<any> {
	return obj && typeof obj.then === 'function';
}

function runInParallel<T>(thisArg: any, handlers: Handlers<T>, event: T) {
	return new Promise<void>((resolve, reject) => {
		let pending = 0;
		const fulfill = () => {
			if (--pending === 0) {
				resolve();
			}
		};

		const { length } = handlers;
		for (let index = 0; index < length; ++index) {
			const result = handlers[index].call(thisArg, event);
			if (isPromise(result)) {
				++pending;
				result.then(fulfill, reject);
			}
		}
	});
}

function runInSeries<T>(thisArg: any, handlers: Handlers<T>, event: T) {
	return new Promise<void>((resolve, reject) => {
		const { length } = handlers;
		let index = 0;

		const next = () => {
			if (index >= length) {
				resolve();
				return;
			}

			const result = handlers[index++].call(thisArg, event);
			if (isPromise(result)) {
				result.then(next, reject);
			}
			else {
				next();
			}
		};

		next();
	});
}

export function createAsync<T = void>(options?: AsyncSignalOptions): AsyncSignal<T> {
	const backend = createBackend<T>(options?.backend);
	const run = options?.parallel ? runInParallel : runInSeries;

	const signal = function (this: any, event?: T) {
		return run(this, backend.beginRead(), event!).finally(() => {
			backend.endRead();
		});
	};

	signal.backend = backend;
	return signal;
}
