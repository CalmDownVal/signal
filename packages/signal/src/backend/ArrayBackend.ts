import type { SignalBackend, SignalBackendFactory, WrappedSignalHandler } from '~/types';

/** @internal */
export interface ArrayBackend<T> extends SignalBackend<T> {
	$handlers: WrappedSignalHandler<T>[];
	$snapshot: WrappedSignalHandler<T>[] | null;
}

export const ArrayBackendFactory: SignalBackendFactory<ArrayBackend<any>> = {
	$create() {
		return {
			$factory: ArrayBackendFactory,
			$handlers: [],
			$snapshot: null
		};
	},
	$getSnapshot(backend) {
		return (backend.$snapshot ??= backend.$handlers.slice());
	},
	$add(backend, handler) {
		backend.$handlers.push(handler);
		backend.$snapshot = null;
	},
	$clear(backend) {
		if (backend.$handlers.length === 0) {
			return false;
		}

		backend.$handlers = [];
		backend.$snapshot = null;
		return true;
	},
	$size(backend) {
		return backend.$handlers.length;
	},
	$delete(backend, handler) {
		const { $handlers } = backend;
		let index = $handlers.length - 1;
		let current;

		while (index >= 0) {
			current = $handlers[index];
			if (current === handler || current.$once === handler) {
				break;
			}

			--index;
		}

		if (index === -1) {
			return false;
		}

		$handlers.splice(index, 1);
		backend.$snapshot = null;
		return true;
	},
	$deleteWrapped(backend, handler) {
		const index = backend.$handlers.lastIndexOf(handler);
		if (index !== -1) {
			backend.$handlers.splice(index, 1);
			backend.$snapshot = null;
		}
	}
};
