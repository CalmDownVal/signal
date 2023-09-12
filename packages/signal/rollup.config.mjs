import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import deleteBeforeBuild from 'rollup-plugin-delete';
import definitions from 'rollup-plugin-dts';

// eslint-disable-next-line import/no-default-export
export default [
	{
		input: './src/index.ts',
		output: [
			{
				exports: 'named',
				file: './build/index.cjs.min.js',
				format: 'cjs',
				sourcemap: true
			},
			{
				exports: 'named',
				file: './build/index.esm.min.mjs',
				format: 'esm',
				sourcemap: true
			}
		],
		plugins: [
			deleteBeforeBuild({
				runOnce: true,
				targets: './build/*'
			}),
			typescript(),
			terser({
				mangle: {
					properties: {
						// force-mangle all properties with the $ prefix
						regex: /^\$.*$/
					}
				},
				output: {
					comments: false
				}
			})
		]
	},
	{
		input: './src/index.ts',
		output: {
			file: './build/index.d.ts',
			format: 'es'
		},
		plugins: [ definitions() ]
	}
];
