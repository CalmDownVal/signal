import assert from 'assert';
import * as sinon from 'sinon';

import * as Signal from '../src/signal';

describe('Signal.on(), Signal.once() and triggering', () => {
	it('should register and correctly execute a basic handler', () => {
		const handler = sinon.fake();
		const test = Signal.create<any>();

		Signal.on(test, handler);
		test('123');
		test(1, 2, 3);

		assert(handler.calledTwice);
		assert(handler.calledWith('123'));
		assert(handler.calledWith(1, 2, 3));
	});

	it('should automatically remove "once" handlers after first invocation', () => {
		const handler = sinon.fake();
		const test = Signal.create();

		Signal.once(test, handler);
		test();
		test();

		assert(handler.calledOnce);
	});

	it('shout invoke double registered handlers twice', () => {
		const handler = sinon.fake();
		const test = Signal.create();

		Signal.on(test, handler);
		Signal.on(test, handler);
		test();

		assert(handler.calledTwice);
	});
});

describe('Signal.off()', () => {
	it('should return FALSE when the handler does not exist', () => {
		const handler = () => undefined;
		const test = Signal.create();

		assert(Signal.off(test, handler) === false);
	});

	it('should return TRUE when the handler is found and removed', () => {
		const handler = () => undefined;
		const test = Signal.create();

		Signal.on(test, handler);
		assert(Signal.off(test, handler) === true);
	});

	it('should not trigger handlers after de-registration', () => {
		const handler = sinon.fake();
		const test = Signal.create();

		Signal.on(test, handler);
		Signal.off(test, handler);
		test();

		assert(handler.notCalled);
	});

	it('should only remove one handler registration at a time', () => {
		const handler = sinon.fake();
		const test = Signal.create();

		Signal.on(test, handler);
		Signal.on(test, handler);
		Signal.off(test, handler);
		test();

		assert(handler.calledOnce);
	});
});
