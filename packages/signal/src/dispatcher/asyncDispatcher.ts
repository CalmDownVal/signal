import type { AsyncSignalOptions, SignalBackend, WrappedSignalHandler } from '~/types';

function isThennable(obj: any): obj is Promise<any> {
	return obj && typeof obj.then === 'function';
}

function dispatchInParallel<T>(thisArg: any, snapshot: readonly WrappedSignalHandler<T>[], event: T) {
	return new Promise<void>((resolve, reject) => {
		const { length } = snapshot;
		let pending = 0;

		const onHandlerResolved = () => {
			if (--pending === 0) {
				resolve();
			}
		};

		for (let index = 0; index < length; ++index) {
			const result = snapshot[index].call(thisArg, event);
			if (isThennable(result)) {
				++pending;
				result.then(onHandlerResolved, reject);
			}
		}
	});
}

function dispatchInSeries<T>(thisArg: any, snapshot: readonly WrappedSignalHandler<T>[], event: T) {
	return new Promise<void>((resolve, reject) => {
		const { length } = snapshot;
		let index = 0;

		const next = () => {
			if (index >= length) {
				resolve();
				return;
			}

			const result = snapshot[index++].call(thisArg, event);
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

export function createAsyncDispatcher<T = void>(backend: SignalBackend<T>, options?: AsyncSignalOptions) {
	const run = options?.parallel ? dispatchInParallel : dispatchInSeries;
	return function (this: any, event?: T) {
		return run(this, backend.$getSnapshot(), event!);
	};
}
