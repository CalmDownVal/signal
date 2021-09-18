import assert from 'assert';

import sinon from 'sinon';

import * as Signal from '..';

const clock = sinon.useFakeTimers();
const delay = <T>(fn: () => T, ms: number) => sinon.spy(() => new Promise<T>((resolve, reject) => {
	setTimeout(() => {
		try {
			resolve(fn());
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

			await clock.nextAsync();
			assert(b.calledOnce);

			await clock.nextAsync();
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

			const pending = assert.rejects(test, ex => ex === error);
			await clock.runAllAsync();
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

			await clock.runAllAsync();
			await pending;
		});

		it('should propagate the first rejection and suppress any others', async () => {
			const firstError = new Error();
			const secondError = new Error();

			const a = delay(() => {
				throw firstError;
			}, 100);

			const b = delay(() => {
				throw secondError;
			}, 200);

			const onUnhandledRejection = sinon.fake();
			process.addListener('unhandledRejection', onUnhandledRejection);

			const test = Signal.createAsync({ parallel: true });
			Signal.on(test, a);
			Signal.on(test, b);

			const pending = assert.rejects(test, ex => ex === firstError);
			await clock.runAllAsync();
			await pending;

			assert(onUnhandledRejection.notCalled);
		});
	});
});
