import babel from 'rollup-plugin-babel';

export default [{
    input: 'src/main.js',
    output: {
        file: 'dist/san-store.source.js',
        format: 'umd',
        name: 'san-store'
    },
	plugins: [babel()],
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

	plugins: [babel()],
    external: ['san-composition']
}];
