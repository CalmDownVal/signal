import type { SignalBackendType } from '@cdv/signal';

const backends: SignalBackendType[] = [
	'array',
	'set'
];

export function forEachBackend(title: string, fn: (backend: SignalBackendType) => void) {
	for (const backend of backends) {
		describe(`[backend: ${backend}] ${title}`, () => fn(backend));
	}
}
