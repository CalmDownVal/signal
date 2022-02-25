import { testAddingHandlers } from './cases/addingHandlers';
import { testEventDispatching } from './cases/eventDispatching';
import { testNewInstanceCreation } from './cases/newInstanceCreation';
import { testRemovingHandlers } from './cases/removingHandlers';
import { Reporter } from './Reporter';
import { Runner } from './Runner';

(async () => {
	const reporter = new Reporter('benchmark-results.md');
	const runner = new Runner(reporter);

	try {
		await testNewInstanceCreation(runner);
		await testEventDispatching(runner, 100);
		await testAddingHandlers(runner, 100);
		await testRemovingHandlers(runner, 100);
	}
	finally {
		reporter.close();
	}
})();
