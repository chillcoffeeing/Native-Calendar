import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import copy from 'rollup-plugin-copy'
import scss from 'rollup-plugin-scss'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import serve from 'rollup-plugin-serve'
import pkg from './package.json'

export default {
    input: 'src/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            exports: 'default',
        },
        {
            file: pkg.module,
            format: 'es',
            exports: 'default',
        },
        {
            file: pkg.browser,
            format: 'umd',
            exports: 'default',
            name: 'NativeCalendar',
        },
        {
            file: 'dist/native-calendar.min.js',
            format: 'iife',
            exports: 'default',
            name: 'NativeCalendar',
            plugins: [terser()],
        },
    ],
    plugins: [
        scss({
            output: 'dist/assets/css/native-calendar.css',
        }),
        typescript({
            tsconfig: './tsconfig.json',
        }),
        nodeResolve(),
        commonjs(),
        copy({
            targets: [
                {
                    src: 'src/assets/images/**/*',
                    dest: 'dist/assets/images',
                },
            ],
        }),
        serve({
            open: true,
            host: 'localhost',
            port: 3000,
            contentBase: ['test', 'dist'],
        }),
    ],
}
