import type { SignalBackend, SignalHandler, WrappedSignalHandler } from '~/types';

export function createES6MapBackend<T>(): SignalBackend<T> {
	const collection = new Map<SignalHandler<T>, WrappedSignalHandler<T>>();
	return {
		add(handler) {
			const key = handler.$wrapped ?? handler;
			const current = collection.get(key);
			if (current) {
				if (current.$wrapped === handler) {
					current.$skip = true;
				}
				else {
					return;
				}
			}

			collection.set(key, handler);
		},
		hasHandlers() {
			return collection.size > 0;
		},
		removeAll() {
			if (collection.size === 0) {
				return false;
			}

			collection.clear();
			return true;
		},
		remove(handler) {
			return collection.delete(handler);
		},
		snapshot() {
			return Array.from(collection.values());
		}
	};
}
