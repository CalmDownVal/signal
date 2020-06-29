import assert from 'assert';
import * as sinon from 'sinon';

import * as Signal from '../src/signal';

let clock: sinon.SinonFakeTimers;
before(() => {
	clock = sinon.useFakeTimers();
});

const delay = (then: () => any, ms: number) =>
	sinon.spy(() => new Promise((resolve, reject) =>
		setTimeout(() => {
			try {
				resolve(then());
			}
			catch (error) {
				reject(error);
			}
		}, ms)));

describe('async serial strategy', () => {
	it('should invoke handlers one at a time', async () => {
		const a = delay(() => 1, 100);
		const b = delay(() => 2, 100);

		const test = Signal.createAsync();
		Signal.on(test, a);
		Signal.on(test, b);

		const pending = test();
		assert(a.calledOnce);
		assert(b.notCalled);

		await clock.tickAsync(100);
		assert(b.calledOnce);

		await clock.tickAsync(100);
		await pending;
	});

	it('should propagate errors', async () => {
		const a = delay(() => 1, 100);
		const b = delay(() => {
			throw new Error();
		}, 100);

		const test = Signal.createAsync();
		Signal.on(test, a);
		Signal.on(test, b);

		const pending = assert.rejects(test);
		await clock.tickAsync(200);
		await pending;
	});
});

describe('async parallel strategy', () => {
	it('should invoke handlers all at once', async () => {
		const a = delay(() => 1, 100);
		const b = delay(() => 2, 100);

		const test = Signal.createAsync({ parallel: true });
		Signal.on(test, a);
		Signal.on(test, b);

		const pending = test();
		assert(a.calledOnce);
		assert(b.calledOnce);

		await clock.tickAsync(100);
		await pending;
	});

	it('should propagate errors', async () => {
		const a = delay(() => 1, 100);
		const b = delay(() => {
			throw new Error();
		}, 100);

		const test = Signal.createAsync({ parallel: true });
		Signal.on(test, a);
		Signal.on(test, b);

		const pending = assert.rejects(test);
		await clock.tickAsync(100);
		await pending;
	});
});
