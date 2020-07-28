const gulp = require("gulp");
const rollup = require("rollup");
const http = require("http");
const log = require("fancy-log");
const { string } = require("rollup-plugin-string");
const handler = require("serve-handler");
const json = require("@rollup/plugin-json");
const commonjs = require("@rollup/plugin-commonjs");
const babel = require("rollup-plugin-babel");
const babelTypescript = require("@babel/preset-typescript");
const babelDecorators = require("@babel/plugin-proposal-decorators");
const babelClassProperties = require("@babel/plugin-proposal-class-properties");

const { nodeResolve } = require("@rollup/plugin-node-resolve");
const gzipPlugin = require("rollup-plugin-gzip");
const { terser } = require("rollup-plugin-terser");

const extensions = [".js", ".ts"];
const isProd = process.env.NODE_ENV === "production";

const DevelopPlugins = [
  commonjs(),
  nodeResolve({
    extensions,
    preferBuiltins: false,
    browser: true,
    rootDir: "./src",
  }),
  json({
    compact: true,
    preferConst: true,
  }),
  string({
    include: ["node_modules/**/*.css"],
  }),
  babel({
    babelrc: false,
    presets: [babelTypescript.default],
    plugins: [
      "@babel/syntax-dynamic-import",
      "@babel/plugin-proposal-optional-chaining",
      "@babel/plugin-proposal-nullish-coalescing-operator",
      [babelDecorators.default, { decoratorsBeforeExport: true }],
      [babelClassProperties.default, { loose: true }],
    ].filter(Boolean),
    extensions,
    exclude: [require.resolve("@mdi/js/mdi.js")],
  }),
];

const BuildPlugins = DevelopPlugins.concat([
  terser({
    output: { comments: false },
  }),
  gzipPlugin.default(),
]);

const DebugPlugins = DevelopPlugins.concat([gzipPlugin.default()]);

const inputconfig = {
  input: "./src/main.ts",
  plugins: isProd ? BuildPlugins : DevelopPlugins,
};
const outputconfig = {
  file: "./hacs_frontend/main.js",
  format: "iife",
  intro: "const __DEMO__ = false;",
};

function createServer() {
  const server = http.createServer((request, response) => {
    return handler(request, response, {
      public: "./hacs_frontend/",
    });
  });

  server.listen(5000, true, () => {
    log.info("File will be served to http://127.0.0.1:5000/main.js");
  });
}

gulp.task("rollup-develop", () => {
  const watcher = rollup.watch({
    input: inputconfig.input,
    plugins: inputconfig.plugins,
    output: outputconfig,
    watch: {
      chokidar: { usePolling: true },
      include: ["./src/**"],
    },
  });

  let startedHttp = false;
  let first = true;

  watcher.on("event", (event) => {
    if (!startedHttp) {
      startedHttp = true;
      createServer();
    }
    if (event.code === "BUNDLE_START") {
      log(`Build started @ ${new Date().toLocaleTimeString()}`);
    } else if (event.code === "BUNDLE_END") {
      log(`Build done @ ${new Date().toLocaleTimeString()}`);
      if (first) {
        log("You can now use the generated file");
        log("A new file will be generated if you change something");
        first = false;
      }
    } else if (event.code === "ERROR") {
      log.error(event.error);
    }
  });
});

gulp.task("rollup-build", async function (task) {
  const bundle = await rollup.rollup(inputconfig);
  await bundle.write(outputconfig);
  task();
});

gulp.task("rollup-build-debug", async function (task) {
  inputconfig.plugins = DebugPlugins;
  outputconfig.file = "./hacs_frontend/debug.js";
  const bundle = await rollup.rollup(inputconfig);
  await bundle.write(outputconfig);
  task();
});
