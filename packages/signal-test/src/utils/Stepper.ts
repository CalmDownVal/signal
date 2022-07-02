import sinon from 'sinon';

interface Step {
	callback(): any;
	resolve?(result: any): void;
	reject?(reason: any): void;
}

function noop() {
	// do nothing
}

export class Stepper {
	private readonly fifo: Step[] = [];

	public add(callback?: () => void): () => Promise<void>;
	public add<T>(callback: () => T): () => Promise<T>;
	public add(callback = noop) {
		const step: Step = {
			callback
		};

		this.fifo.push(step);
		return () => new Promise((resolve, reject) => {
			step.resolve = resolve;
			step.reject = reject;
		});
	}

	public spy(callback?: () => void): sinon.SinonSpy<[], Promise<void>>;
	public spy<T>(callback: () => T): sinon.SinonSpy<[], Promise<T>>;
	public spy(callback?: () => any) {
		return sinon.spy(this.add(callback));
	}

	public advance() {
		const step = this.fifo.shift();
		if (!step) {
			return Promise.reject(new Error('There are no more steps in the queue.'));
		}

		return new Promise(resolve => {
			if (step.resolve && step.reject) {
				try {
					step.resolve(step.callback());
				}
				catch (ex) {
					step.reject(ex);
				}
			}

			process.nextTick(resolve);
		});
	}

	public async advanceAll() {
		while (this.fifo.length) {
			await this.advance();
		}
	}
}
