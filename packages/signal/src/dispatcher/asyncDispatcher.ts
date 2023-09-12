import type { AsyncSignalOptions, SignalBackend, WrappedSignalHandler } from '~/types';

export function createAsyncDispatcher<T = void>(backend: SignalBackend<T>, options?: AsyncSignalOptions) {
	const run = options?.parallel ? dispatchInParallel : dispatchInSeries;
	return function (this: any, event?: T) {
		return run(this, backend.$factory.$getSnapshot(backend), event!);
	};
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

		let index = 0;
		while (index < length) {
			const result = snapshot[index].call(thisArg, event);
			if (isAwaitable(result)) {
				++pending;
				result.then(onHandlerResolved, reject);
			}

			++index;
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
			if (isAwaitable(result)) {
				result.then(next, reject);
			}
			else {
				next();
			}
		};

		next();
	});
}

function isAwaitable(obj: any): obj is Promise<any> {
	return obj && typeof obj.then === 'function';
}
