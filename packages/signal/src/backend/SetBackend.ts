import type { SignalBackend, SignalBackendFactory, SignalHandler, WrappedSignalHandler } from '~/types';

/** @internal */
export interface SetSignalBackend<T> extends SignalBackend<T> {
	$handlers: Map<SignalHandler<T>, WrappedSignalHandler<T>>;
	$snapshot: WrappedSignalHandler<T>[] | null;
}

/** @internal */
export const SetBackend: SignalBackendFactory<SetBackend<any>> = {
	$create() {
		return {
			$factory: SetBackend,
			$handlers: new Map<SignalHandler<any>, WrappedSignalHandler<any>>(),
			$snapshot: null
		};
	},
	$getSnapshot(backend) {
		return (backend.$snapshot ??= Array.from(backend.$handlers.values()));
	},
	$add(backend, handler) {
		if (handler.$once) {
			if (backend.$handlers.has(handler.$once)) {
				return;
			}

			backend.$handlers.set(handler.$once, handler);
		}
		else {
			backend.$handlers.set(handler, handler);
		}

		backend.$snapshot = null;
	},
	$clear(backend) {
		if (backend.$handlers.size > 0) {
			backend.$handlers.clear();
			backend.$snapshot = null;
			return true;
		}

		return false;
	},
	$size(backend) {
		return backend.$handlers.size;
	},
	$delete(backend, handler) {
		if (!backend.$handlers.delete(handler)) {
			return false;
		}

		backend.$snapshot = null;
		return true;
	},
	$deleteWrapped(backend, handler) {
		if (backend.$handlers.delete(handler.$once!)) {
			backend.$snapshot = null;
		}
	}
};
