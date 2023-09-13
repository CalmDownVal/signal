import EventEmitter from 'node:events';

import { create, on, off, type SyncSignal } from '@cdv/signal';

import { Runner } from '~/core/Runner';
import { BACKENDS, repeat, times } from '~/core/utils/misc';

interface Params {
	readonly n: number;
}

await Runner.benchmark<Params>(({ n }) => {
	const handlers = times(n, () => () => {});
	const unknownHandler = () => {};

	return {
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

					repeat(n, i => {
						emitter.addListener('test', handlers[i]);
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

					repeat(n, i => {
						on(signal, handlers[i]);
					});

					return signal;
				},
				test(signal: SyncSignal) {
					off(signal, unknownHandler);
				}
			}))
		]
	};
});
