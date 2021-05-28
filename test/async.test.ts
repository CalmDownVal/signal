import assert from 'assert';

import sinon from 'sinon';

import * as Signal from '..';

const clock = sinon.useFakeTimers();
const delay = (then: () => any, ms: number) => sinon.spy(() => new Promise<123>((resolve, reject) => {
	setTimeout(() => {
		try {
			resolve(then());
		}
		catch (ex) {
			reject(ex);
		}
	}, ms);
}));

describe('Asynchronous signals', () => {
	describe('Serial strategy', () => {
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

		it('should immediately propagate a rejection', async () => {
			const error = new Error();

			const a = delay(() => 1, 100);
			const b = delay(() => {
				throw error;
			}, 100);
			const c = delay(() => 3, 100);

			const test = Signal.createAsync();
			Signal.on(test, a);
			Signal.on(test, b);
			Signal.on(test, c);

			const pending = assert.rejects(test, e => e === error);
			await clock.tickAsync(200);
			await pending;

			// since b rejects, c should not get called
			assert(a.calledOnce);
			assert(b.calledOnce);
			assert(c.notCalled);
		});
	});

	describe('Parallel strategy', () => {
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

		it('should propagate the first rejection and suppress any others', async () => {
			const error = new Error();

			const a = delay(() => 1, 100);
			const b = delay(() => {
				throw error;
			}, 100);

			// fake a promise
			const cThen = sinon.fake();
			const c = () => ({ then: cThen } as any);

			const test = Signal.createAsync({ parallel: true });
			Signal.on(test, a);
			Signal.on(test, b);
			Signal.on(test, c);

			const pending = assert.rejects(test, e => e === error);
			await clock.tickAsync(100);
			await pending;

			// handlers must always receive a reject handler
			assert(cThen.calledOnceWith(
				sinon.match.func,
				sinon.match.func
			));
		});
	});
});
