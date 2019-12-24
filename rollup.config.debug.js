import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import babel from "rollup-plugin-babel";
import json from "@rollup/plugin-json";
import gzipPlugin from "rollup-plugin-gzip";

export default {
  input: ["src/main.ts"],
  output: {
    file: `hacs_frontend/debug.js`,
    format: "es"
  },
  plugins: [
    nodeResolve({}),
    commonjs(),
    typescript(),
    json(),
    babel({
      exclude: "node_modules/**"
    }),
    gzipPlugin()
  ]
};
