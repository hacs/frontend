const path = require("path");
const gulp = require("gulp");
const rollup = require("rollup");
const handler = require("serve-handler");
const http = require("http");
const log = require("fancy-log");
const open = require("open");
const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve");
const json = require("@rollup/plugin-json");
const babel = require("rollup-plugin-babel");
const typescript = require("rollup-plugin-typescript2");
const replace = require("@rollup/plugin-replace");
const { string } = require("rollup-plugin-string");
const { terser } = require("rollup-plugin-terser");

const extensions = [".js", ".ts"];

const bothBuilds = (createConfigFunc, params) =>
  gulp.series(
    async function buildLatest() {
      await buildRollup(
        createConfigFunc({
          ...params,
          latestBuild: true,
        })
      );
    },
    async function buildES5() {
      await buildRollup(
        createConfigFunc({
          ...params,
          latestBuild: false,
        })
      );
    }
  );

function createServer(serveOptions) {
  const server = http.createServer((request, response) => {
    return handler(request, response, {
      public: serveOptions.root,
    });
  });

  server.listen(serveOptions.port, serveOptions.networkAccess ? "0.0.0.0" : undefined, () => {
    log.info(`Available at http://localhost:${serveOptions.port}`);
    open(`http://localhost:${serveOptions.port}`);
  });
}

function watchRollup(createConfig) {
  const { inputOptions, outputOptions } = createConfig;

  const watcher = rollup.watch({
    ...inputOptions,
    output: [outputOptions],
    watch: {
      chokidar: {
        usePolling: true,
      },
      include: ["src/**"],
    },
  });

  let startedHttp = false;

  watcher.on("event", (event) => {
    if (event.code === "BUNDLE_END") {
      log(`Build done @ ${new Date().toLocaleTimeString()}`);
    } else if (event.code === "ERROR") {
      log.error(event.error);
    } else if (event.code === "END") {
      if (startedHttp) {
        return;
      }
      startedHttp = true;
      createServer(serveOptions);
    }
  });
}
gulp.task("rollup-watch-app", () => {
  watchRollup({
    inputOptions: {
      input: "./src/main.ts",
      preserveEntrySignatures: false,
      plugins: [
        resolve({
          extensions,
          preferBuiltins: false,
          browser: true,
          rootDir: "./src",
        }),
        commonjs({
          namedExports: {
            "js-yaml": ["safeDump", "safeLoad"],
          },
        }),
        json(),
        babel({
          babelrc: false,
          presets: [
            [require("@babel/preset-env").default, { modules: false }],
            require("@babel/preset-typescript").default,
          ].filter(Boolean),
          plugins: [
            // Part of ES2018. Converts {...a, b: 2} to Object.assign({}, a, {b: 2})
            ["@babel/plugin-proposal-object-rest-spread", { loose: true, useBuiltIns: true }],
            // Only support the syntax, Webpack will handle it.
            "@babel/syntax-dynamic-import",
            "@babel/plugin-proposal-optional-chaining",
            "@babel/plugin-proposal-nullish-coalescing-operator",
            [
              require("@babel/plugin-proposal-decorators").default,
              { decoratorsBeforeExport: true },
            ],
            [require("@babel/plugin-proposal-class-properties").default, { loose: true }],
          ],
        }),
        replace(),
      ],
    },
    outputOptions: {
      dir: "./hacs_frontend/",
      format: "es",
      sourcemap: "inline",
    },
  });
});
