import type { SignalBackend } from '~/types';

/** @internal */
export function createSyncDispatcher<T = void>(backend: SignalBackend<T>) {
	return function (this: any, event?: T) {
		const snapshot = backend.$factory.$getSnapshot(backend);
		const { length } = snapshot;

		let index = 0;
		while (index < length) {
			snapshot[index].call(this, event!);
			++index;
		}
	};
}
