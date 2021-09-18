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

	it('two intertwined invocations must correctly handle list mutations', () => {
		const test = Signal.create<boolean>({ backend });

		const handlerTwo = sinon.fake();
		const handlerOne = sinon.fake((retrigger: boolean) => {
			if (retrigger) {
				// trigger the signal a second time within the first invocation
				test(false);
			}

			// The second invocation has finished now, but the first is still
			// halfway. If we remove the second handler now, it must not affect
			// the first invocation's handler list, i.e. he second handler must
			// still be called.
			Signal.off(test, handlerTwo);
		});

		Signal.on(test, handlerOne);
		Signal.on(test, handlerTwo);
		test(true);

		assert(handlerOne.calledTwice);
		assert(handlerTwo.calledTwice);
	});
});
