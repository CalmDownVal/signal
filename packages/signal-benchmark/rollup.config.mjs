import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';
import externals from 'rollup-plugin-node-externals';

const packageRootDir = dirname(fileURLToPath(import.meta.url));
function resolve(path) {
	return join(packageRootDir, path);
}

// eslint-disable-next-line import/no-default-export
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
		externals({
			devDeps: true
		}),
		typescript()
	]
};
