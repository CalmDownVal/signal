import type { AsyncSignalOptions, Handlers, SignalBackend } from '~/types';

function isThennable(obj: any): obj is Promise<any> {
	return obj && typeof obj.then === 'function';
}

function runInParallel<T>(thisArg: any, handlers: Handlers<T>, event: T) {
	return new Promise<void>((resolve, reject) => {
		let pending = 0;
		const onHandlerResolved = () => {
			if (--pending === 0) {
				resolve();
			}
		};

		const { length } = handlers;
		for (let index = 0; index < length; ++index) {
			const result = handlers[index].call(thisArg, event);
			if (isThennable(result)) {
				++pending;
				result.then(onHandlerResolved, reject);
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
			if (isThennable(result)) {
				result.then(next, reject);
			}
			else {
				next();
			}
		};

		next();
	});
}

export function createAsyncRunner<T = void>(backend: SignalBackend<T>, options?: AsyncSignalOptions) {
	const run = options?.parallel ? runInParallel : runInSeries;
	return function (this: any, event?: T) {
		return run(this, backend.snapshot(), event!);
	};
}
