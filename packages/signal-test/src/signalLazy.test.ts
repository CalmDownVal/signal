import assert from 'node:assert';

import * as Signal from '@cdv/signal';
import sinon from 'sinon';

describe('Signal.lazy()', () => {
	describe('Synchronous', () => {
		it('should not do anything when no handlers are attached', () => {
			const test = Signal.create();
			const factory = sinon.fake();

			const returnValue = Signal.lazy(test, factory);

			assert(factory.notCalled);
			assert.strictEqual(returnValue, false);
		});

		it('should execute factory callback and trigger the signal when handlers are attached', () => {
			const test = Signal.create();
			const handler = sinon.fake();
			const factory = sinon.fake(() => 123);

			Signal.on(test, handler);
			const returnValue = Signal.lazy(test, factory);

			assert(factory.calledOnce);
			assert(handler.calledOnceWith(123));
			assert.strictEqual(returnValue, true);
		});
	});

	describe('Asynchronous', () => {
		it('should not do anything when no handlers are attached', async () => {
			const test = Signal.create({ async: true });
			const factory = sinon.fake();

			const pendingResult = Signal.lazy(test, factory);

			assert(pendingResult instanceof Promise);
			const returnValue = await pendingResult;

			assert(factory.notCalled);
			assert.strictEqual(returnValue, false);
		});

		it('should execute factory callback and trigger the signal when handlers are attached', async () => {
			const test = Signal.create({ async: true });
			const handler = sinon.fake();
			const factory = sinon.fake(() => 123);

			Signal.on(test, handler);

			const pendingResult = Signal.lazy(test, factory);

			assert(pendingResult instanceof Promise);
			const returnValue = await pendingResult;

			assert(factory.calledOnce);
			assert(handler.calledOnceWith(123));
			assert.strictEqual(returnValue, true);
		});
	});
});
