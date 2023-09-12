import assert from 'node:assert';

import * as Signal from '@cdv/signal';

describe('Signal creation', () => {
	describe('Signal.create()', () => {
		it('should create synchronous signals when `async` is set to FALSE', () => {
			const test = Signal.create({ async: false });
			assert.strictEqual(test.isAsync, false);

			const result: unknown = test();
			assert(result === undefined);
		});

		it('should create asynchronous signals when `async` is set to TRUE', async () => {
			const test = Signal.create({ async: true });
			assert.strictEqual(test.isAsync, true);

			const result: unknown = test();
			assert(result instanceof Promise);

			await result;
		});
	});
});
