import type { SignalBackend, SignalBackendFactory, WrappedSignalHandler } from '@cdv/signal';

/** @internal */
export interface DefaultSignalBackend<T> extends SignalBackend<T> {
	$handlers: WrappedSignalHandler<T>[];
	$snapshot: WrappedSignalHandler<T>[] | null;
}

/** @internal */
export const DefaultBackend: SignalBackendFactory<DefaultSignalBackend<any>> = {
	$create() {
		return {
			$factory: DefaultBackend,
			$handlers: [],
			$snapshot: null
		};
	},
	$getSnapshot(backend) {
		return (backend.$snapshot ??= backend.$handlers.slice());
	},
	$add(backend, handler, prepend) {
		if (prepend) {
			backend.$handlers.unshift(handler);
		}
		else {
			backend.$handlers.push(handler);
		}

		backend.$snapshot = null;
	},
	$clear(backend) {
		if (backend.$handlers.length === 0) {
			return false;
		}

		backend.$handlers.length = 0;
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

		// Searching from the back: The same handler can be added multiple times
		// and we must remove the last one to preserve execution order.
		while (index >= 0) {
			current = $handlers[index];
			if (current === handler || current.$once === handler) {
				$handlers.splice(index, 1);
				backend.$snapshot = null;
				return true;
			}

			--index;
		}

		return false;
	},
	$deleteWrapped(backend, handler) {
		const index = backend.$handlers.lastIndexOf(handler);
		if (index !== -1) {
			backend.$handlers.splice(index, 1);
			backend.$snapshot = null;
		}
	}
};
