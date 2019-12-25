import babel from 'rollup-plugin-babel';

export default {
    input: 'src/main.js',
    output: {
        file: 'dist/san-store.source.js',
        format: 'umd',
        name: 'san-store'
    },

	plugins: [babel()]
};