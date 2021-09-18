import { Suite } from 'benchmark';

import * as Signal from '..';

const backends: Signal.SignalBackendType[] = [
	'array',
	'es6map'
];

function runSuite<T>(
	name: string,
	init: (backend: Signal.SignalBackendType) => T,
	test: (initResult: T) => void
) {
	const suite = new Suite();
	for (const backend of backends) {
		const initResult = init(backend);
		suite.add(backend, test.bind(null, initResult));
	}

	return new Promise<void>(resolve => {
		console.group(name);
		suite
			.on('cycle', (e: any) => {
				console.log(e.target.toString());
			})
			.on('complete', () => {
				console.log('Fastest: ' + suite.filter('fastest').map('name'));
				console.groupEnd();
				resolve();
			})
			.run({ async: true });
	});
}

(async (n: number) => {
	await runSuite(
		'create a signal instance',
		backend => backend,
		backend => {
			Signal.create({ backend });
		}
	);

	await runSuite(
		`add ${n} handlers, then clear`,
		backend => Signal.create({ backend }),
		signal => {
			for (let i = 0; i < n; ++i) {
				Signal.on(signal, () => {});
			}

			Signal.off(signal);
		}
	);

	await runSuite(
		`attempt to remove an unknown handler from a signal with ${n} handlers`,
		backend => {
			const signal = Signal.create({ backend });
			for (let i = 0; i < n; ++i) {
				Signal.on(signal, () => {});
			}

			return signal;
		},
		signal => {
			Signal.off(signal, () => {});
		}
	);

	await runSuite(
		`trigger a signal with ${n} handlers`,
		backend => {
			const signal = Signal.create({ backend });
			for (let i = 0; i < n; ++i) {
				Signal.on(signal, () => {});
			}

			return signal;
		},
		signal => {
			signal();
		}
	);
})(1000);
