import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';
import gzipPlugin from 'rollup-plugin-gzip'

const dev = process.env.ROLLUP_WATCH;

const serveopts = {
    contentBase: ['./hacs_frontend'],
    host: '0.0.0.0',
    port: 5000,
    allowCrossOrigin: true,
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
};

const plugins = [
    nodeResolve({}),
    commonjs(),
    typescript(),
    json(),
    babel({
        exclude: 'node_modules/**'
    }),
    dev && serve(serveopts),
    !dev && terser(),
    !dev && gzipPlugin(),
];

export default [
    {
        input: ['src/main.ts'],
        output: {
            dir: 'hacs_frontend',
            format: 'es',
        },
        plugins: [...plugins],
    },
];