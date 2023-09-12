import type { SignalBackend, SignalBackendFactory, WrappedSignalHandler } from '~/types';

/** @internal */
export interface SetBackend<T> extends SignalBackend<T> {
	$persistent: Set<WrappedSignalHandler<T>>;
	$oneshot: WrappedSignalHandler<T>[];
	$snapshot: WrappedSignalHandler<T>[] | null;
}

export const SetBackendFactory: SignalBackendFactory<SetBackend<any>> = {
	$create() {
		// We use Set for all persistent handlers, but we must use an array for
		// 'once' handlers. We assume this array will be empty most of the time.
		return {
			$factory: SetBackendFactory,
			$persistent: new Set<WrappedSignalHandler<any>>(),
			$oneshot: [],
			$snapshot: null
		};
	},
	$getSnapshot(backend) {
		return (backend.$snapshot ??= Array.from(backend.$persistent.values()).concat(backend.$oneshot));
	},
	$add(backend, handler) {
		if (handler.$once) {
			if (backend.$persistent.has(handler.$once)) {
				return;
			}

			backend.$oneshot.push(handler);
		}
		else {
			backend.$persistent.add(handler);
			deleteOneshot(backend, handler);
		}

		backend.$snapshot = null;
	},
	$clear(backend) {
		if (this.$size(backend)) {
			backend.$persistent.clear();
			backend.$oneshot = [];
			backend.$snapshot = null;
			return true;
		}

		return false;
	},
	$size(backend) {
		return backend.$persistent.size + backend.$oneshot.length;
	},
	$delete(backend, handler) {
		if (backend.$persistent.delete(handler)) {
			backend.$snapshot = null;
			return true;
		}

		return deleteOneshot(backend, handler);
	},
	$deleteWrapped(backend, handler) {
		const index = backend.$oneshot.lastIndexOf(handler);
		if (index !== -1) {
			backend.$oneshot.splice(index, 1);
			backend.$snapshot = null;
		}
	}
};

function deleteOneshot<T>(backend: SetBackend<T>, handler: WrappedSignalHandler<T>) {
	const { $oneshot } = backend;
	let index = $oneshot.length - 1;
	while (index >= 0) {
		if ($oneshot[index].$once === handler) {
			$oneshot.splice(index, 1);
			backend.$snapshot = null;
			return true;
		}

		--index;
	}

	return false;
}
