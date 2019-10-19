import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import serve from 'rollup-plugin-serve'

export default {
    input: ['src/main.ts'],
    output: {
        dir: 'build',
        format: 'es',
    },
    plugins: [
        resolve(),
        typescript(),
        serve({
            contentBase: ['build'],
            host: '0.0.0.0',
            port: 5000,
        }),
    ]
};