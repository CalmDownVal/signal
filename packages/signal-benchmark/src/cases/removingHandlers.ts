import EventEmitter from 'events';

import { create, on, off, SyncSignal } from '@calmdownval/signal';

import type { Runner } from '~/Runner';
import { BACKENDS, repeat } from '~/utils';

export function testRemovingHandlers(runner: Runner, n: number) {
	const unknownHandler = () => {};

	return runner.benchmark(`Removing With ${n} Other Handlers Attached`, [
		{
			name: 'EventEmitter',
			init() {
				const emitter = new EventEmitter();
				emitter.setMaxListeners(n);

				repeat(n, () => {
					emitter.addListener('test', () => {});
				});

				return emitter;
			},
			test(emitter: EventEmitter) {
				emitter.removeListener('test', unknownHandler);
			}
		},
		...BACKENDS.map(backend => ({
			name: `Signal (${backend} backend)`,
			init() {
				const signal = create({ backend });

				repeat(n, () => {
					on(signal, () => {});
				});

				return signal;
			},
			test(signal: SyncSignal) {
				off(signal, unknownHandler);
			}
		}))
	]);
}
