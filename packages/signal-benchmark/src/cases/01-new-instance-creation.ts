import EventEmitter from 'node:events';

import { create, type SignalOptions } from '@cdv/signal';

import { Runner } from '~/core/Runner';
import { BACKENDS } from '~/core/utils/misc';

await Runner.benchmark(() => {
	// Assigning to this variable prevents V8 from over-optimizing the test cases.
	/* eslint-disable @typescript-eslint/no-unused-vars */
	let instance: any;

	return {
		title: 'New Instance Creation',
		comment: `\
This test simply creates a new instance of EventEmitter or Signal with no
additional logic`,
		testCases: [
			{
				name: 'EventEmitter',
				test() {
					instance = new EventEmitter();
				}
			},
			...BACKENDS.map(backend => ({
				name: `Signal (${backend} backend)`,
				init() {
					return { backend };
				},
				test(options: SignalOptions) {
					instance = create(options);
				}
			}))
		]
	};
});
