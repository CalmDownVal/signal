import { SignalBackendType } from '..';

const backends: SignalBackendType[] = [
	'array',
	'es6map'
];

export function withBackend(title: string, fn: (backend: SignalBackendType) => void) {
	for (const backend of backends) {
		describe(`[backend: ${backend}] ${title}`, () => fn(backend));
	}
}
