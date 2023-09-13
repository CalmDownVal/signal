export function runInParallelLimitingConcurrency<T>(limit: number, tasks: readonly (() => Promise<T>)[]) {
	return new Promise<PromiseSettledResult<T>[]>(resolve => {
		const results = new Array<PromiseSettledResult<T>>(tasks.length);

		let tickets = limit;
		let countDone = 0;
		let index = 0;

		function runNext() {
			if (tickets === 0 || index === tasks.length) {
				return false;
			}

			--tickets;

			const i = index++;
			tasks[i]()
				.then(
					value => {
						results[i] = {
							status: 'fulfilled',
							value
						};
					},
					reason => {
						results[i] = {
							status: 'rejected',
							reason
						};
					}
				)
				.finally(() => {
					if (++countDone === tasks.length) {
						resolve(results);
					}
					else {
						++tickets;
						runAvailable();
					}
				});

			return true;
		}

		function runAvailable() {
			while (runNext()) {
				// no-op
			}
		}

		runAvailable();
	});
}
