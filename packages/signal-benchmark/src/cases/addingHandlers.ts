import EventEmitter from 'node:events';

import { create, off, on, type SyncSignal } from '@cdv/signal';

import type { Runner } from '~/Runner';
import { BACKENDS, repeat, times } from '~/utils';

export function testAddingHandlers(runner: Runner, n: number) {
	const handlers = times(n, () => () => {});

	return runner.benchmark({
		title: `Add ${n} Handlers, Then Reset`,
		comment: `\
This is a somewhat unfair comparison for the Set backend, as it has additional
logic to only allow unique handlers.`,
		testCases: [
			{
				name: 'EventEmitter',
				init() {
					return new EventEmitter().setMaxListeners(n);
				},
				test(emitter: EventEmitter) {
					repeat(n, i => {
						emitter.addListener('test', handlers[i]);
					});

					emitter.removeAllListeners('test');
				}
			},
			...BACKENDS.map(backend => ({
				name: `Signal (${backend} backend)`,
				init() {
					return create({ backend });
				},
				test(signal: SyncSignal) {
					repeat(n, i => {
						on(signal, handlers[i]);
					});

					off(signal);
				}
			}))
		]
	});
}
