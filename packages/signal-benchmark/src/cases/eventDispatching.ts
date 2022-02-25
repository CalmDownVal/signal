import EventEmitter from 'events';

import { create, on, SyncSignal } from '@calmdownval/signal';

import type { Runner } from '~/Runner';
import { BACKENDS, repeat } from '~/utils';

export function testEventDispatching(runner: Runner, n: number) {
	const event = {};
	return runner.benchmark(`Dispatch to ${n} Handlers`, [
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
				emitter.emit('test', event);
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
			test(signal: SyncSignal<any>) {
				signal(event);
			}
		}))
	]);
}
