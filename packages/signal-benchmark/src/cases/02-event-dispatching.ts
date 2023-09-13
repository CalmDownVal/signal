import EventEmitter from 'node:events';

import { create, on, type SyncSignal } from '@cdv/signal';

import { Runner } from '~/core/Runner';
import { BACKENDS, repeat, times } from '~/core/utils/misc';

interface Params {
	readonly n: number;
}

await Runner.benchmark<Params>(({ n }) => {
	const handlers = times(n, () => () => {});
	const event = {};

	return {
		title: `Dispatch to ${n} Handlers`,
		comment: `\
This test dispatches an event object to an EventEmitter or Signal with ${n}
handlers.`,
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
					emitter.emit('test', event);
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
				test(signal: SyncSignal<any>) {
					signal(event);
				}
			}))
		]
	};
});
