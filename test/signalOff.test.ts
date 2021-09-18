import assert from 'assert';

import sinon from 'sinon';

import * as Signal from '..';
import { withBackend } from './utils';

withBackend('Signal.off()', backend => {
	describe('Return value', () => {
		it('should return FALSE when a handler is not found', () => {
			const handler = () => undefined;
			const test = Signal.create({ backend });

			assert.strictEqual(Signal.off(test, handler), false);
		});

		it('should return FALSE when no handlers are registered', () => {
			const test = Signal.create({ backend });

			assert.strictEqual(Signal.off(test), false);
		});

		it('should return TRUE when a handler is found and removed', () => {
			const handler = () => undefined;
			const test = Signal.create({ backend });

			Signal.on(test, handler);
			assert.strictEqual(Signal.off(test, handler), true);
		});

		it('should return TRUE when handlers are registered', () => {
			const handler = () => undefined;
			const test = Signal.create({ backend });

			Signal.on(test, handler);
			assert.strictEqual(Signal.off(test), true);
		});
	});

	describe('Handler list manipulation', () => {
		it('should not trigger handlers after de-registration', () => {
			const handler0 = sinon.fake();
			const handler1 = sinon.fake();
			const test = Signal.create({ backend });

			Signal.on(test, handler0);
			Signal.on(test, handler1);
			Signal.off(test, handler0);
			test();

			assert(handler0.notCalled);
			assert(handler1.calledOnce);
		});

		it('should remove all handlers', () => {
			const handler0 = sinon.fake();
			const handler1 = sinon.fake();
			const test = Signal.create({ backend });

			Signal.on(test, handler0);
			Signal.on(test, handler1);

			Signal.off(test);
			test();

			assert(handler0.notCalled);
			assert(handler1.notCalled);
		});
	});
});
