import typescript from '@rollup/plugin-typescript';
import deleteBeforeBuild from 'rollup-plugin-delete';
import { nodeExternals } from 'rollup-plugin-node-externals';

// eslint-disable-next-line import/no-default-export
export default {
	input: './src/index.ts',
	output: {
		file: './build/index.esm.mjs',
		format: 'esm'
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
