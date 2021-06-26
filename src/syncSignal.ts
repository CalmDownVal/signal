import type { Handlers, SyncSignal, SyncSignalOptions } from './types';

export function createSync<T = void>(_options?: SyncSignalOptions): SyncSignal<T> {
	let isUsingList = false;

	const signal = function (this: any, event?: T) {
		isUsingList = true;
		try {
			const handlers = signal.handlers;
			const length = handlers.length;
			for (let i = 0; i < length; ++i) {
				void handlers[i].call(this, event!);
			}
		}
		finally {
			isUsingList = false;
		}
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
