import assert from 'assert';
import * as sinon from 'sinon';

import * as Signal from '..';

describe('Signal invocation', () => {
	it('should forward arguments', () => {
		const handler = sinon.fake();
		const test = Signal.create<any>();

		// using objects to verify args are forwarded referentially equal
		const arg0 = {};
		const arg1 = {};
		const arg2 = {};

		Signal.on(test, handler);
		test(arg0, arg1, arg2);

		assert(handler.calledOnceWithExactly(arg0, arg1, arg2));
	});

	it('should forward `thisArg` when invoked via .call', () => {
		let innerThis: any;
		const handler = function () {
			innerThis = this;
		};

		const outerThis = {};
		const test = Signal.create();

		Signal.on(test, handler);
		test.call(outerThis);

		assert.strictEqual(innerThis, outerThis);
	});
});
