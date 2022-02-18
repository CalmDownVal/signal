import assert from 'assert';

import sinon from 'sinon';

import * as Signal from '..';

describe('Signal.lazy()', () => {
	describe('Synchronous', () => {
		it('should not do anything when no handlers are attached', () => {
			const test = Signal.createSync();
			const factory = sinon.fake();

			const returnValue = Signal.lazy(test, factory);

			assert(factory.notCalled);
			assert.strictEqual(returnValue, undefined);
		});

		it('should execute factory callback and trigger the signal when handlers are attached', () => {
			const test = Signal.createSync();
			const handler = sinon.fake();
			const factory = sinon.fake(() => 123);

			Signal.on(test, handler);
			const returnValue = Signal.lazy(test, factory);

			assert(factory.calledOnce);
			assert(handler.calledOnceWith(123));
			assert.strictEqual(returnValue, undefined);
		});
	});

	describe('Asynchronous', () => {
		it('should not do anything when no handlers are attached', async () => {
			const test = Signal.createAsync();
			const factory = sinon.fake();

			const returnValue = Signal.lazy(test, factory);

			assert(returnValue instanceof Promise);
			await returnValue;

			assert(factory.notCalled);
		});

		it('should execute factory callback and trigger the signal when handlers are attached', async () => {
			const test = Signal.createAsync();
			const handler = sinon.fake();
			const factory = sinon.fake(() => 123);

			Signal.on(test, handler);

			const returnValue = Signal.lazy(test, factory);

			assert(returnValue instanceof Promise);
			await returnValue;

			assert(factory.calledOnce);
			assert(handler.calledOnceWith(123));
		});
	});
});
