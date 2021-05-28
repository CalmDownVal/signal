import assert from 'assert';

import sinon from 'sinon';

import * as Signal from '..';

describe('Signal invocation', () => {
	it('should forward arguments', () => {
		const handler = sinon.fake();
		const test = Signal.create<any>();

		// using an object to verify the forwarded argument is referentially equal
		const event = {};

		Signal.on(test, handler);
		test(event);

		assert(handler.calledOnceWithExactly(event));
	});

	it('should forward `thisArg` when invoked via .call', () => {
		let innerThis: any;
		const handler = function (this: any) {
			innerThis = this;
		};

		const outerThis = {};
		const test = Signal.create();

		Signal.on(test, handler);
		test.call(outerThis);

		assert.strictEqual(innerThis, outerThis);
	});
});
