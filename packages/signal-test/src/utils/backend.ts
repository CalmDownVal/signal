import type { SignalBackendType } from '@calmdownval/signal';

const backends: SignalBackendType[] = [
	'array',
	'set'
];

export function forEachBackend(title: string, fn: (backend: SignalBackendType) => void) {
	for (const backend of backends) {
		describe(`[backend: ${backend}] ${title}`, () => fn(backend));
	}
}
