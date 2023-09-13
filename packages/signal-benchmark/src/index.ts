import * as OS from 'node:os';

import { CompositeReporter } from './core/CompositeReporter';
import { ConsoleReporter } from './core/ConsoleReporter';
import { MarkdownReporter } from './core/MarkdownReporter';
import { Runner } from './core/Runner';
import { runInParallelLimitingConcurrency } from './core/utils/parallelism';

(async () => {
	const runner = new Runner();
	const benchmarks = [
		runner.runTask('01-new-instance-creation'),
		runner.runTask('02-event-dispatching', { n: 100 }),
		runner.runTask('03-adding-handlers', { n: 100 }),
		runner.runTask('04-removing-handlers', { n: 100 })
	];

	const limit = OS.cpus().length;
	const results = await runInParallelLimitingConcurrency(limit, benchmarks);

	const reporter = new CompositeReporter([
		new ConsoleReporter(),
		await MarkdownReporter.create('./benchmark-results.md')
	]);

	results.forEach(result => {
		if (result.status === 'fulfilled') {
			reporter.report(result.value);
		}
	});

	await reporter.close();
})();
