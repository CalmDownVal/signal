import assert from 'assert';

import * as Signal from '@calmdownval/signal';
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
