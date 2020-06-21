import { terser } from "rollup-plugin-terser";
import cleanup from "rollup-plugin-cleanup";
import commonjs from "rollup-plugin-commonjs";
import serve from "rollup-plugin-serve";
import gzipPlugin from "rollup-plugin-gzip";
import json from "@rollup/plugin-json";
import nodeResolve from "rollup-plugin-node-resolve";
import progress from "rollup-plugin-progress";
import typescript from "rollup-plugin-typescript2";

const isdev = process.env.ROLLUP_WATCH;

const opts_json = {
  compact: true,
  preferConst: true,
};

const opts_terser = {};

const serveopts = {
  contentBase: ["./hacs_frontend"],
  host: "0.0.0.0",
  port: 5000,
  poll: true,
  allowCrossOrigin: true,
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
};

const opts_cleanup = {
  comments: "none",
};

const AwesomePlugins = [
  progress(),
  nodeResolve(),
  commonjs(),
  typescript(),
  json(opts_json),
  !isdev && terser(opts_terser),
  !isdev && cleanup(opts_cleanup),
  isdev && serve(serveopts),
  !isdev && gzipPlugin(),
];

export default [
  {
    watch: {
      chokidar: {
        usePolling: true,
      },
    },
    input: ["src/main.ts"],
    output: {
      file: `hacs_frontend/main.js`,
      intro: "const __DEMO__ = false;",
      format: "iife",
    },
    plugins: [...AwesomePlugins],
  },
];
