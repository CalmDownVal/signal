import assert from 'node:assert';

import * as Signal from '@cdv/signal';
import sinon from 'sinon';

import { Stepper } from './utils/Stepper';

describe('Asynchronous signals', () => {
	describe('Serial strategy', () => {
		it('should invoke handlers one at a time', async () => {
			const stepper = new Stepper();
			const first = stepper.spy();
			const second = stepper.spy();

			const test = Signal.create({ async: true });
			Signal.on(test, first);
			Signal.on(test, second);

			const pending = test();
			assert(first.calledOnce);
			assert(second.notCalled);

			await stepper.advance();
			assert(second.calledOnce);

			await stepper.advance();
			await pending;
		});

		it('should immediately propagate a rejection', async () => {
			const error = new Error();
			const stepper = new Stepper();

			const first = stepper.spy();
			const second = stepper.spy(() => {
				throw error;
			});

			const third = stepper.spy();

			const test = Signal.create({ async: true });
			Signal.on(test, first);
			Signal.on(test, second);
			Signal.on(test, third);

			const pending = assert.rejects(test, ex => ex === error);
			await stepper.advanceAll();
			await pending;

			// since b rejects, c should not get called
			assert(first.calledOnce);
			assert(second.calledOnce);
			assert(third.notCalled);
		});
	});

	describe('Parallel strategy', () => {
		it('should invoke handlers all at once', async () => {
			const stepper = new Stepper();
			const first = stepper.spy();
			const second = stepper.spy();

			const test = Signal.create({
				async: true,
				parallel: true
			});

			Signal.on(test, first);
			Signal.on(test, second);

			const pending = test();
			assert(first.calledOnce);
			assert(second.calledOnce);

			await stepper.advanceAll();
			await pending;
		});

		it('should propagate the first rejection and suppress any others', async () => {
			const firstError = new Error();
			const secondError = new Error();

			const stepper = new Stepper();
			const first = stepper.spy(() => {
				throw firstError;
			});

			const second = stepper.spy(() => {
				throw secondError;
			});

			const onUnhandledRejection = sinon.fake();
			process.addListener('unhandledRejection', onUnhandledRejection);

			const test = Signal.create({
				async: true,
				parallel: true
			});

			Signal.on(test, first);
			Signal.on(test, second);

			const pending = assert.rejects(test, ex => ex === firstError);
			await stepper.advanceAll();
			await pending;

			process.removeListener('unhandledRejection', onUnhandledRejection);
			assert(onUnhandledRejection.notCalled);
		});
	});
});
