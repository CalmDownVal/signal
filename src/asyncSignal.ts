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
	let isUsingList = false;

	const run = options?.parallel ? runInParallel : runInSeries;
	const signal = function (this: any, event?: T) {
		isUsingList = true;
		return run(this, signal.handlers, event!).finally(() => {
			isUsingList = false;
		});
	};

	signal.handlers = [] as Handlers<T>;
	signal.lock = (handlers?: Handlers<T>) => {
		if (isUsingList) {
			signal.handlers = handlers ?? signal.handlers.slice();
			isUsingList = false;
		}
		else if (handlers) {
			signal.handlers = handlers;
		}
	};

	return signal;
}
