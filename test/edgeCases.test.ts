import assert from 'assert';

import sinon from 'sinon';

import * as Signal from '..';
import { withBackend } from './utils';

withBackend('Edge cases', backend => {
	it('should not affect current invocation when the handler list is changed from within a handler', () => {
		const test = Signal.create({ backend });

		const second = sinon.fake();
		const first = sinon.fake(() => {
			Signal.off(test, second);
		});

		Signal.on(test, first);
		Signal.on(test, second);

		test();
		assert(first.calledOnce);
		assert(second.calledOnce);

		test();
		assert(first.calledTwice);
		assert(second.calledOnce);
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

		const second = sinon.fake();
		const first = sinon.fake((retrigger: boolean) => {
			if (retrigger) {
				// trigger the signal a second time within the first invocation
				test(false);
			}

			// The second invocation has finished now, but the first is still
			// halfway. If we remove the second handler now, it must not affect
			// the first invocation's handler list, i.e. the second handler must
			// still get called.
			Signal.off(test, second);
		});

		Signal.on(test, first);
		Signal.on(test, second);
		test(true);

		assert(first.calledTwice);
		assert(second.calledTwice);
	});
});
