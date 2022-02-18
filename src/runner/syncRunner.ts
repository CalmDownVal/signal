import type { SignalBackend, SyncSignalOptions } from '~/types';

export function createSyncRunner<T = void>(backend: SignalBackend<T>, _options?: SyncSignalOptions) {
	return function (this: any, event?: T) {
		const snapshot = backend.snapshot();
		const { length } = snapshot;
		for (let i = 0; i < length; ++i) {
			void snapshot[i].call(this, event!);
		}
	};
}
