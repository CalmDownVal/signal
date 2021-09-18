import type { SignalBackend, SignalBackendType, SignalHandler, WrappedSignalHandler } from './types';

function shouldReplace<T>(prev: WrappedSignalHandler<T>, next: WrappedSignalHandler<T>) {
	return prev.$originalSignalHandler === next;
}

function createArrayBackend<T>(): SignalBackend<T> {
	let collection: WrappedSignalHandler<T>[] = [];

	const indexOf = (handler: WrappedSignalHandler<T>) => {
		const key = handler.$originalSignalHandler ?? handler;
		const { length } = collection;

		let searchIndex = length - 1;
		let current;

		while (searchIndex >= 0) {
			current = collection[searchIndex];
			if (current === key || current.$originalSignalHandler === key) {
				break;
			}

			--searchIndex;
		}

		return searchIndex;
	};

	return {
		add(handler) {
			const index = indexOf(handler);
			if (index !== -1) {
				const current = collection[index];
				if (shouldReplace(current, handler)) {
					collection[index] = handler;
					current.$skipRemove = true;
				}

				return;
			}

			collection.push(handler);
		},
		remove(handler) {
			const index = indexOf(handler);
			if (index === -1) {
				return false;
			}

			collection.splice(index, 1);
			return true;
		},
		removeAll() {
			if (collection.length === 0) {
				return false;
			}

			collection = [];
			return true;
		},
		snapshot() {
			return collection.slice();
		}
	};
}

function createMapBackend<T>(): SignalBackend<T> {
	const collection = new Map<SignalHandler<T>, WrappedSignalHandler<T>>();

	return {
		add(handler) {
			const key = handler.$originalSignalHandler ?? handler;
			const current = collection.get(key);
			if (current) {
				if (shouldReplace(current, handler)) {
					current.$skipRemove = true;
				}
				else {
					return;
				}
			}

			collection.set(key, handler);
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

const backend: Record<SignalBackendType, <T>() => SignalBackend<T>> = {
	array: createArrayBackend,
	es6map: createMapBackend
};

export function createBackend<T>(type?: SignalBackendType) {
	return backend[type ?? 'array']<T>();
}
