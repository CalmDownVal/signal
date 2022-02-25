import { join } from 'path';

import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';
import externals from 'rollup-plugin-node-externals';

function resolve(path) {
	return join(__dirname, path);
}

export default {
	input: resolve('./src/index.ts'),
	output: {
		file: resolve('./build/index.esm.mjs'),
		format: 'esm'
	},
	plugins: [
		del({
			targets: resolve('./build/*')
		}),
		externals(),
		typescript()
	]
};
