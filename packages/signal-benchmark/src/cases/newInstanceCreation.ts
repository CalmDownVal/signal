import EventEmitter from 'events';

import { create } from '@calmdownval/signal';

import type { Runner } from '~/Runner';
import { BACKENDS } from '~/utils';

export function testNewInstanceCreation(runner: Runner) {
	// Assigning to this variable prevents V8 from over-optimizing the test cases.
	/* eslint-disable @typescript-eslint/no-unused-vars */
	let instance: any;

	return runner.benchmark('New Instance Creation', [
		{
			name: 'EventEmitter',
			test() {
				instance = new EventEmitter();
			}
		},
		...BACKENDS.map(backend => ({
			name: `Signal (${backend} backend)`,
			test() {
				instance = create({ backend });
			}
		}))
	]);
}
