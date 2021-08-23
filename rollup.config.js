import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import copy from 'rollup-plugin-copy'
import scss from "rollup-plugin-scss";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json";

export default {
	input: "src/index.ts",
	output: [
		{ file: pkg.main, format: "cjs", exports: "default", name: "NativeCalendar" },
		{ file: pkg.module, format: "es", exports: "default", name: "NativeCalendar" },
		{ file: pkg.browser, format: "iife", exports: "default", name: "NativeCalendar"},
	],
	plugins: [typescript(), nodeResolve(), commonjs(), scss({output: "dist/css/n-calendar.css"}), copy({
		targets: [
			{ src: 'src/assets/images/**/*', dest: 'dist/assets/images' }
		]
	})],
}

