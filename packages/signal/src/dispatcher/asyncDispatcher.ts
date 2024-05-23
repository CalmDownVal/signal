import type { AsyncSignalOptions, SignalBackend, WrappedSignalHandler } from '~/types';

/** @internal */
export function createAsyncDispatcher<T = void>(backend: SignalBackend<T>, options?: AsyncSignalOptions) {
	const run = options?.parallel ? dispatchInParallel : dispatchInSeries;
	return function (this: any, event?: T) {
		return run(this, backend.$factory.$getSnapshot(backend), event!);
	};
}

function dispatchInParallel<T>(thisArg: any, snapshot: readonly WrappedSignalHandler<T>[], event: T) {
	return new Promise<boolean>((resolve, reject) => {
		let pending = 0;
		let index = 0;
		let result;

		const { length } = snapshot;
		const onHandlerResolved = () => {
			if (--pending === 0) {
				resolve(length > 0);
			}
		};

		while (index < length) {
			result = snapshot[index].call(thisArg, event);
			if (isThenable(result)) {
				++pending;
				result.then(onHandlerResolved, reject);
			}

			++index;
		}
	});
}

function dispatchInSeries<T>(thisArg: any, snapshot: readonly WrappedSignalHandler<T>[], event: T) {
	return new Promise<boolean>((resolve, reject) => {
		let index = 0;

		const { length } = snapshot;
		const next = () => {
			if (index >= length) {
				resolve(length > 0);
				return;
			}

			const result = snapshot[index++].call(thisArg, event);
			if (isThenable(result)) {
				result.then(next, reject);
			}
			else {
				next();
			}
		};

		next();
	});
}

function isThenable(obj: any): obj is Promise<any> {
	return obj && typeof obj.then === 'function';
}
