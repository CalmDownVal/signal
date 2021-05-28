import { off, on } from './methods';
import { createSync } from './syncSignal';

export function createAbortSignal() {
	let isAborted = false;

	const aborted = createSync();
	const signal = {
		get aborted() {
			return isAborted;
		},
		addEventListener(type: string, listener: () => any) {
			if (type === 'abort') {
				on(aborted, listener);
			}
		},
		removeEventListener(type: string, listener: () => any) {
			if (type === 'abort') {
				off(aborted, listener);
			}
		}
	};

	return {
		signal,
		abort() {
			if (!isAborted) {
				isAborted = true;
				aborted();
			}
		}
	};
}
