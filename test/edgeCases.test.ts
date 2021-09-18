import assert from 'assert';

import sinon from 'sinon';

import * as Signal from '..';
import { withBackend } from './utils';

withBackend('Edge cases', backend => {
	it('should not affect current invocation when the handler list is changed from within a handler', () => {
		const test = Signal.create({ backend });

		const handlerTwo = sinon.fake();
		const handlerOne = sinon.fake(() => {
			Signal.off(test, handlerTwo);
		});

		Signal.on(test, handlerOne);
		Signal.on(test, handlerTwo);

		test();
		assert(handlerOne.calledOnce);
		assert(handlerTwo.calledOnce);

		test();
		assert(handlerOne.calledTwice);
		assert(handlerTwo.calledOnce);
	});

	it('should replace `once` handlers even when re-subscribed *within* a handler itself', () => {
		const test = Signal.create({ backend });
		const handler = sinon.fake(() => {
			Signal.on(test, handler);
		});

		Signal.once(test, handler);
		test();
		test();

		assert(handler.calledTwice);
	});
});
