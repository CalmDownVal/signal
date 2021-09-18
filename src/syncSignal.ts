import { createBackend } from './backend';
import type { SyncSignal, SyncSignalOptions } from './types';

export function createSync<T = void>(options?: SyncSignalOptions): SyncSignal<T> {
	const backend = createBackend<T>(options?.backend);
	const signal = function (this: any, event?: T) {
		try {
			const snapshot = backend.beginRead();
			const { length } = snapshot;
			for (let i = 0; i < length; ++i) {
				void snapshot[i].call(this, event!);
			}
		}
		finally {
			backend.endRead();
		}
	};

	signal.backend = backend;
	return signal;
}
