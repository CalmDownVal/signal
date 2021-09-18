import assert from 'assert';

import sinon from 'sinon';

import * as Signal from '..';
import { withBackend } from './utils';

withBackend('Signal.on(), Signal.once()', backend => {
	it('should correctly register a handler', () => {
		const handler = sinon.fake();
		const test = Signal.create({ backend });

		Signal.on(test, handler);
		test();

		assert(handler.calledOnce);
	});

	it('should not register the same handler multiple times', () => {
		const handler = sinon.fake();
		const test = Signal.create({ backend });

		Signal.on(test, handler);
		Signal.on(test, handler);
		test();

		assert(handler.calledOnce);
	});

	it('should auto-remove `once` handlers after first invocation', () => {
		const handler = sinon.fake();
		const test = Signal.create({ backend });

		Signal.once(test, handler);
		test();
		test();

		assert(handler.calledOnce);
	});

	it('should replace `once` handlers when re-subscribed', () => {
		const handler = sinon.fake();
		const test = Signal.create({ backend });

		Signal.once(test, handler);
		Signal.on(test, handler);
		test();
		test();

		assert(handler.calledTwice);
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

		// the handler should be removed by now, test() shouldn't throw
		test();
		assert(handler.calledOnce);
	});
});
