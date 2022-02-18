import assert from 'assert';

import * as Signal from '..';
import { withBackend } from './utils';

withBackend('signal.hasHandler property', backend => {
	it('should equal to FALSE when initialized', () => {
		const test = Signal.create({ backend });

		assert.strictEqual(test.hasHandlers, false);
	});

	it('should change to TRUE after adding a handler', () => {
		const test = Signal.create({ backend });
		const handler = () => {};

		Signal.on(test, handler);

		assert.strictEqual(test.hasHandlers, true);
	});

	it('should change to FALSE after removing all handlers', () => {
		const test = Signal.create({ backend });
		const handler = () => {};

		Signal.on(test, handler);
		Signal.off(test, handler);

		assert.strictEqual(test.hasHandlers, false);
	});
});
