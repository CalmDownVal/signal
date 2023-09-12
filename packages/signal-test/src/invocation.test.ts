import assert from 'node:assert';
import EventEmitter from 'node:events';

import * as Signal from '@cdv/signal';
import sinon from 'sinon';

describe('Signal invocation', () => {
	it('should forward the event argument', () => {
		const event = {};
		const handler = sinon.fake();
		const test = Signal.create<any>();

		Signal.on(test, handler);
		test(event);

		assert(handler.calledWithExactly(event));
	});

	it('should forward `this` when invoked via .call', () => {
		const context = {};
		const handler = sinon.fake();
		const test = Signal.create();

		Signal.on(test, handler);
		test.call(context);

		assert(handler.calledOn(context));
	});

	it('should forward event objects and `this` from EventEmitter', () => {
		const event = {};
		const emitter = new EventEmitter();
		const handler = sinon.fake();
		const test = Signal.create();

		emitter.addListener('test', test);
		Signal.on(test, handler);

		emitter.emit('test', event);

		assert(handler.calledWithExactly(event));
		assert(handler.calledOn(emitter));
	});
});
