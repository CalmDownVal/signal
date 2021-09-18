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
			const first = sinon.fake();
			const second = sinon.fake();
			const test = Signal.create({ backend });

			Signal.on(test, first);
			Signal.on(test, second);
			Signal.off(test, first);
			test();

			assert(first.notCalled);
			assert(second.calledOnce);
		});

		it('should remove all handlers', () => {
			const first = sinon.fake();
			const second = sinon.fake();
			const test = Signal.create({ backend });

			Signal.on(test, first);
			Signal.on(test, second);

			Signal.off(test);
			test();

			assert(first.notCalled);
			assert(second.notCalled);
		});
	});
});
