import typescript from '@rollup/plugin-typescript';
import deleteBeforeBuild from 'rollup-plugin-delete';
import { nodeExternals } from 'rollup-plugin-node-externals';

// eslint-disable-next-line import/no-default-export
export default {
	input: {
		'runner': './src/index.ts',

		// benchmarks:
		'01-new-instance-creation': './src/cases/01-new-instance-creation.ts',
		'02-event-dispatching': './src/cases/02-event-dispatching.ts',
		'03-adding-handlers': './src/cases/03-adding-handlers.ts',
		'04-removing-handlers': './src/cases/04-removing-handlers.ts'
	},
	output: {
		dir: './build',
		entryFileNames: '[name].mjs',
		chunkFileNames: '[name]-[hash].mjs',
		format: 'esm',
		exports: 'named'
	},
	plugins: [
		deleteBeforeBuild({
			runOnce: true,
			targets: './build/*'
		}),
		nodeExternals({
			devDeps: true
		}),
		typescript()
	]
};
