import type { SignalBackendType } from '@cdv/signal';

export const BACKENDS: SignalBackendType[] = [
	'array',
	'set'
];

export function repeat(n: number, callback: (index: number) => void) {
	let i = 0;
	while (i < n) {
		callback(i);
		++i;
	}
}

export function times<T>(n: number, callback: (index: number) => T): T[] {
	const array = new Array<T>(n);
	let i = 0;
	while (i < n) {
		array[i] = callback(i);
		++i;
	}

	return array;
}

export function noOp() {
	// no-op
}
