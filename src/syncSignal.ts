import { createBackend } from './backend';
import type { SyncSignal, SyncSignalOptions } from './types';

export function createSync<T = void>(options?: SyncSignalOptions): SyncSignal<T> {
	const backend = createBackend<T>(options?.backend);
	const signal = function (this: any, event?: T) {
		const snapshot = backend.snapshot();
		const { length } = snapshot;
		for (let i = 0; i < length; ++i) {
			void snapshot[i].call(this, event!);
		}
	};

	signal.backend = backend;
	return signal;
}
