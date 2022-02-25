import { join } from 'path';

import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';
import definitions from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';

const minified = {
	sourcemap: true,
	plugins: [
		terser({
			mangle: {
				properties: {
					// mangle all properties with the $ prefix
					regex: /^\$.*$/
				}
			},
			output: {
				comments: false
			}
		})
	]
};

function resolve(path) {
	return join(__dirname, path);
}

export default [
	{
		input: resolve('./src/index.ts'),
		output: [
			{
				...minified,
				file: resolve('./build/index.cjs.min.js'),
				format: 'cjs'
			},
			{
				...minified,
				file: resolve('./build/index.esm.min.mjs'),
				format: 'esm'
			}
		],
		plugins: [
			del({
				targets: resolve('./build/*')
			}),
			typescript()
		]
	},
	{
		input: resolve('./src/index.ts'),
		output: {
			file: resolve('./build/index.d.ts'),
			format: 'es'
		},
		plugins: [
			definitions()
		]
	}
];
