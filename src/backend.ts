import type { SignalBackend, SignalBackendType, SignalHandler, WrappedSignalHandler } from './types';

function shouldReplace<T>(prev: WrappedSignalHandler<T>, next: WrappedSignalHandler<T>) {
	return prev.$originalSignalHandler === next;
}

function createArrayBackend<T>(): SignalBackend<T> {
	let collection: WrappedSignalHandler<T>[] = [];
	let isUsed = false;

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

	const willMutate = () => {
		if (isUsed) {
			collection = collection.slice();
			isUsed = false;
		}
	};

	return {
		add(handler) {
			const index = indexOf(handler);
			if (index !== -1) {
				const current = collection[index];
				if (shouldReplace(current, handler)) {
					// We don't consider this a mutation as it's the same
					// handler just changing from 'once' to regular.
					collection[index] = handler;
					current.$skipRemove = true;
				}

				return;
			}

			willMutate();
			collection.push(handler);
		},
		remove(handler) {
			const index = indexOf(handler);
			if (index === -1) {
				return false;
			}

			willMutate();
			collection.splice(index, 1);

			return true;
		},
		removeAll() {
			if (collection.length === 0) {
				return false;
			}

			collection = [];
			isUsed = false;

			return true;
		},
		beginRead() {
			isUsed = true;
			return collection;
		},
		endRead() {
			isUsed = false;
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
		beginRead() {
			return Array.from(collection.values());
		},
		endRead() {
			// no-op
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
