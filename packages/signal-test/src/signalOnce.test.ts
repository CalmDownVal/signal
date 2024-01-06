import assert from 'node:assert';

import * as Signal from '@cdv/signal';
import sinon from 'sinon';

import { forEachBackend } from './utils/backend';

forEachBackend('Signal.once()', backend => {
	it('should auto-remove `once` handlers after first invocation', () => {
		const handler = sinon.fake();
		const test = Signal.create({ backend: 'array' });

		Signal.once(test, handler);
		test();
		test();

		assert(handler.calledOnce);
	});

	it('should remove a `once` handler even when it throws', () => {
		const error = new Error();
		const handler = sinon.fake(() => {
			throw error;
		});

		const test = Signal.create({ backend });
		Signal.once(test, handler);

		assert.throws(test, ex => ex === error);
		assert(handler.calledOnce);

		// the handler should be removed by now, test() mustn't throw
		test();
		assert(handler.calledOnce);
	});

	it('`once` handlers are called once per each signal they are attached to', () => {
		const test0 = Signal.create({ backend });
		const test1 = Signal.create({ backend });
		const callback = sinon.fake();

		Signal.once(test0, callback);
		Signal.once(test1, callback);
		test0();
		test1();
		test0();
		test1();

		assert(callback.calledTwice);
	});

	it('`once` handlers are never invoked twice, even in intertwined invocations', () => {
		const test = Signal.create<boolean>({ backend });
		const callback = sinon.fake();

		Signal.on(test, retrigger => {
			if (retrigger) {
				// trigger the signal a second time within the first invocation
				test(false);
			}
		});

		Signal.once(test, callback);
		test(true);

		assert(callback.calledOnce);
	});
});

describe('[backend: set] Signal.once()', () => {
	it('should not distinct `once` wrapped handlers from their original handler', () => {
		const handler = sinon.fake();
		const test = Signal.create({ backend: 'set' });

		Signal.on(test, handler);
		Signal.once(test, handler);
		test();

		assert(handler.calledOnce);
	});
});
