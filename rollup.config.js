import { terser } from "rollup-plugin-terser";
import cleanup from "rollup-plugin-cleanup";
import commonjs from "rollup-plugin-commonjs";
import dev from "rollup-plugin-dev";
import gzipPlugin from "rollup-plugin-gzip";
import json from "@rollup/plugin-json";
import nodeResolve from "rollup-plugin-node-resolve";
import progress from "rollup-plugin-progress";
import sizes from "rollup-plugin-sizes";
import typescript from "rollup-plugin-typescript2";

const isdev = process.env.ROLLUP_WATCH;

const opts_json = {
  compact: true,
  preferConst: true,
};

const opts_terser = {};

const opts_dev = {
  dirs: ["hacs_frontend"],
  port: 5000,
  host: "0.0.0.0",
  poll: true,
};

const opts_cleanup = {
  comments: "none",
};

const opts_sizes = {
  details: true,
};

const AwesomePlugins = [
  progress(),
  nodeResolve(),
  commonjs(),
  typescript(),
  json(opts_json),
  !isdev && terser(opts_terser),
  !isdev && cleanup(opts_cleanup),
  isdev && sizes(),
  isdev && sizes(opts_sizes),
  isdev && dev(opts_dev),
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
      format: "iife",
    },
    plugins: [...AwesomePlugins],
  },
];
