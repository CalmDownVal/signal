import EventEmitter from 'node:events';

import { create, off, on, type SyncSignal } from '@cdv/signal';

import { Runner } from '~/core/Runner';
import { BACKENDS, repeat, times } from '~/core/utils/misc';

interface Params {
	readonly n: number;
}

await Runner.benchmark<Params>(({ n }) => {
	const handlers = times(n, () => () => {});

	return {
		title: `Add ${n} Handlers, Then Remove All`,
		comment: `\
This test adds ${n} unique handlers and then removes them all using the
\`removeAllListeners\` or \`off\` methods for EventEmitter or Signal instances
respectively.

For the Set backend, this is a somewhat unfair comparison, as it has additional
logic to ensure handler uniqueness.`,
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
	};
});
