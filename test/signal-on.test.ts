import assert from 'assert';

import sinon from 'sinon';

import * as Signal from '..';

describe('Signal.on(), Signal.once()', () => {
	it('should correctly register a handler', () => {
		const handler = sinon.fake();
		const test = Signal.create<any>();

		Signal.on(test, handler);
		test();

		assert(handler.calledOnce);
	});

	it('should auto-remove `once` handlers after first invocation', () => {
		const handler = sinon.fake();
		const test = Signal.create();

		Signal.once(test, handler);
		test();
		test();

		assert(handler.calledOnce);
	});

	it('should respect handlers registered multiple times', () => {
		const handler = sinon.fake();
		const test = Signal.create();

		Signal.on(test, handler);
		Signal.on(test, handler);
		test();

		assert(handler.calledTwice);
	});
});
