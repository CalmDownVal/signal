import assert from 'assert';

import * as Signal from '..';

describe('Signal creation', () => {
	describe('Signal.create()', () => {
		it('should have isAsync set to FALSE when created as synchronous', () => {
			const signal = Signal.create({ async: false });
			assert.strictEqual(signal.isAsync, false);
		});

		it('should have isAsync set to TRUE when created as asynchronous', () => {
			const signal = Signal.create({ async: true });
			assert.strictEqual(signal.isAsync, true);
		});
	});

	describe('Signal.createSync()', () => {
		it('should have isAsync set to FALSE when created', () => {
			const signal = Signal.createSync();
			assert.strictEqual(signal.isAsync, false);
		});
	});

	describe('Signal.createAsync()', () => {
		it('should have isAsync set to TRUE when created', () => {
			const signal = Signal.createAsync();
			assert.strictEqual(signal.isAsync, true);
		});
	});
});
