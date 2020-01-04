import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import gzipPlugin from "rollup-plugin-gzip";

export default {
  input: ["src/main.ts"],
  output: {
    file: `hacs_frontend/debug.js`,
    format: "iife"
  },
  plugins: [nodeResolve({}), commonjs(), typescript(), json(), gzipPlugin()]
};
