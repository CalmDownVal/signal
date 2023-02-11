import assert from 'assert';

import * as Signal from '@calmdownval/signal';
import sinon from 'sinon';

import { forEachBackend } from './utils/backend';

forEachBackend('Signal.subscribe()', backend => {
	it('should correctly register a handler and deregister it when calling the unsubscriber', () => {
		const handler = sinon.fake();
		const test = Signal.create({ backend });

		const unsubscribe = Signal.subscribe(test, handler);
		test();

		unsubscribe();
		test();

		assert(handler.calledOnce);
	});
});
