import EventEmitter from 'events';

import { create, on, off, SyncSignal } from '@calmdownval/signal';

import type { Runner } from '~/Runner';
import { BACKENDS, repeat } from '~/utils';

export function testRemovingHandlers(runner: Runner, n: number) {
	const unknownHandler = () => {};

	return runner.benchmark({
		title: `Removing With ${n} Other Handlers Attached`,
		comment: `\
This test first adds ${n} unique handlers to a Signal instance and then attempts
to remove a handler that has not been added. We are therefore measuring the
worst-case performance of the handler lookup.`,
		testCases: [
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
		]
	});
}
