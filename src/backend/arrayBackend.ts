import type { SignalBackend, WrappedSignalHandler } from '~/types';

export function createArrayBackend<T>(): SignalBackend<T> {
	let collection: WrappedSignalHandler<T>[] = [];

	const indexOf = (handler: WrappedSignalHandler<T>) => {
		const key = handler.$wrapped ?? handler;
		const { length } = collection;

		let searchIndex = length - 1;
		let current;

		while (searchIndex >= 0) {
			current = collection[searchIndex];
			if (current === key || current.$wrapped === key) {
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
				if (current.$wrapped === handler) {
					collection[index] = handler;
					current.$skip = true;
				}

				return;
			}

			collection.push(handler);
		},
		hasHandlers() {
			return collection.length > 0;
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
