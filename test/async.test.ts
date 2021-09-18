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
			const first = delay(() => 1, 100);
			const second = delay(() => 2, 100);

			const test = Signal.createAsync();
			Signal.on(test, first);
			Signal.on(test, second);

			const pending = test();
			assert(first.calledOnce);
			assert(second.notCalled);

			await clock.nextAsync();
			assert(second.calledOnce);

			await clock.nextAsync();
			await pending;
		});

		it('should immediately propagate a rejection', async () => {
			const error = new Error();

			const first = delay(() => 1, 100);
			const third = delay(() => 3, 100);
			const second = delay(() => {
				throw error;
			}, 100);

			const test = Signal.createAsync();
			Signal.on(test, first);
			Signal.on(test, second);
			Signal.on(test, third);

			const pending = assert.rejects(test, ex => ex === error);
			await clock.runAllAsync();
			await pending;

			// since b rejects, c should not get called
			assert(first.calledOnce);
			assert(second.calledOnce);
			assert(third.notCalled);
		});
	});

	describe('Parallel strategy', () => {
		it('should invoke handlers all at once', async () => {
			const first = delay(() => 1, 100);
			const second = delay(() => 2, 100);

			const test = Signal.createAsync({ parallel: true });
			Signal.on(test, first);
			Signal.on(test, second);

			const pending = test();
			assert(first.calledOnce);
			assert(second.calledOnce);

			await clock.runAllAsync();
			await pending;
		});

		it('should propagate the first rejection and suppress any others', async () => {
			const firstError = new Error();
			const secondError = new Error();

			const first = delay(() => {
				throw firstError;
			}, 100);

			const second = delay(() => {
				throw secondError;
			}, 200);

			const onUnhandledRejection = sinon.fake();
			process.addListener('unhandledRejection', onUnhandledRejection);

			const test = Signal.createAsync({ parallel: true });
			Signal.on(test, first);
			Signal.on(test, second);

			const pending = assert.rejects(test, ex => ex === firstError);
			await clock.runAllAsync();
			await pending;

			process.removeListener('unhandledRejection', onUnhandledRejection);
			assert(onUnhandledRejection.notCalled);
		});
	});
});
