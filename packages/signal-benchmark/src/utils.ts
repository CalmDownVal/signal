import type { SignalBackendType } from '@cdv/signal';

export const BACKENDS: SignalBackendType[] = [
	'array',
	'set'
];

export function repeat(n: number, callback: (index: number) => void) {
	for (let i = 0; i < n; ++i) {
		callback(i);
	}
}

export function times<T>(n: number, callback: (index: number) => T): T[] {
	const array = new Array<T>(n);
	for (let i = 0; i < n; ++i) {
		array[i] = callback(i);
	}

	return array;
}
