import babel from 'rollup-plugin-babel';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

export default [{
    input: 'src/main.js',
    output: {
        file: 'dist/san-store.source.js',
        format: 'umd',
        name: 'san-store'
    },
	plugins: [
        replace({
            __VERSION__: pkg.version
        }),
        babel()
    ],
    external: ['san-composition']
}, {
    input: 'src/use.js',
    output: {
        file: 'dist/san-store-use.source.js',
        format: 'umd',
        name: 'san-store-use',
        globals: {
            'san-store': 'san-store',
            'san-composition': 'san-composition'
        }
    },

	plugins: [
        replace({
            __VERSION__: pkg.version
        }),
        babel()
    ],
    external: ['san-composition']
}];
