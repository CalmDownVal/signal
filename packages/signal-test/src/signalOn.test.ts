import assert from 'node:assert';

import * as Signal from '@cdv/signal';
import sinon from 'sinon';

import { forEachBackend } from './utils/backend';

forEachBackend('Signal.on()', backend => {
	it('should correctly register a handler', () => {
		const handler = sinon.fake();
		const test = Signal.create({ backend });

		Signal.on(test, handler);
		test();

		assert(handler.calledOnce);
	});
});

describe('[backend: array] Signal.on()', () => {
	it('should allow registering the same handler multiple times', () => {
		const handler = sinon.fake();
		const test = Signal.create({ backend: 'array' });

		Signal.on(test, handler);
		Signal.on(test, handler);
		test();

		assert(handler.calledTwice);
	});

	it('should append handlers at the end by default', () => {
		const handler1 = sinon.fake();
		const handler2 = sinon.fake();
		const test = Signal.create({ backend: 'array' });

		Signal.on(test, handler1);
		Signal.on(test, handler2);
		test();

		sinon.assert.callOrder(handler1, handler2);
	});

	it('should respect the prepend flag', () => {
		const handler1 = sinon.fake();
		const handler2 = sinon.fake();
		const test = Signal.create({ backend: 'array' });

		Signal.on(test, handler1);
		Signal.on(test, handler2, { prepend: true });
		test();

		sinon.assert.callOrder(handler2, handler1);
	});
});

describe('[backend: set] Signal.on()', () => {
	it('should not allow registering the same handler multiple times', () => {
		const handler = sinon.fake();
		const test = Signal.create({ backend: 'set' });

		Signal.on(test, handler);
		Signal.on(test, handler);
		test();

		assert(handler.calledOnce);
	});

	it('should replace `once` handlers with persistent handlers', () => {
		const handler = sinon.fake();
		const test = Signal.create({ backend: 'set' });

		Signal.once(test, handler);
		Signal.on(test, handler);
		test();
		test();

		assert(handler.calledTwice);
	});
});
