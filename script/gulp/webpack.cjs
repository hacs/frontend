const haWebpack = require("../../homeassistant-frontend/build-scripts/webpack.cjs");
const haPaths = require("../../homeassistant-frontend/build-scripts/paths.cjs");
const webpack = require("webpack");
const path = require("path");
const log = require("fancy-log");
const paths = require("./paths.cjs");
const bundle = require("./bundle.cjs");
const fs = require("fs-extra");
const gulp = require("gulp");
const env = require("./env.cjs");

const createWebpackConfig = ({
  name,
  entry,
  outputPath,
  publicPath,
  defineOverlay,
  isProdBuild,
  latestBuild,
  isStatsBuild,
  isTestBuild,
  dontHash,
}) => {
  if (!dontHash) {
    dontHash = new Set();
  }
  haPaths.polymer_dir = paths.home_assistant_frontend_root;
  const haWebpackContents = haWebpack.createWebpackConfig({
    name,
    entry,
    outputPath,
    publicPath,
    defineOverlay,
    isProdBuild,
    latestBuild,
    isStatsBuild,
    isTestBuild,
    isHassioBuild: true,
    dontHash,
  });
  haPaths.polymer_dir = paths.root_dir;
  return {
    ...haWebpackContents,
    output: {
      ...haWebpackContents.output,
      devtoolModuleFilenameTemplate:
        !isTestBuild && isProdBuild
          ? (info) => {
              const sourcePath = info.resourcePath.replace(/^\.\//, "");
              if (sourcePath.startsWith("node_modules") || sourcePath.startsWith("webpack")) {
                return `no-source/${sourcePath}`;
              }
              if (sourcePath.startsWith("homeassistant-frontend/src/")) {
                return `https://raw.githubusercontent.com/home-assistant/frontend/${env.haFrontendVersion()}/${
                  sourcePath.split("homeassistant-frontend/")[1]
                }`;
              }
              if (sourcePath.startsWith("src/")) {
                return `https://raw.githubusercontent.com/hacs/frontend/${env.version()}/${sourcePath}`;
              }
              return `no-source/${sourcePath}`;
            }
          : undefined,
    },
  };
};

const createHacsConfig = ({ isProdBuild, latestBuild, isStatsBuild, isTestBuild }) =>
  createWebpackConfig(
    bundle.config.hacs({
      isProdBuild,
      latestBuild,
      isStatsBuild,
      isTestBuild,
    })
  );

const bothBuilds = (createConfigFunc, params) => [
  createConfigFunc({ ...params, latestBuild: true }),
  createConfigFunc({ ...params, latestBuild: false }),
];

const isWsl =
  fs.existsSync("/proc/version") &&
  fs.readFileSync("/proc/version", "utf-8").toLocaleLowerCase().includes("microsoft");

const doneHandler = (done) => (err, stats) => {
  if (err) {
    log.error(err.stack || err);
    if (err.details) {
      log.error(err.details);
    }
    return;
  }

  if (stats.hasErrors() || stats.hasWarnings()) {
    console.log(stats.toString("minimal"));
  }

  log(`Build done @ ${new Date().toLocaleTimeString()}`);

  if (done) {
    done();
  }
};

const prodBuild = (conf) =>
  new Promise((resolve) => {
    webpack(
      conf,
      // Resolve promise when done. Because we pass a callback, webpack closes itself
      doneHandler(resolve)
    );
  });

gulp.task("webpack-watch-app", () => {
  // This command will run forever because we don't close compiler
  webpack(
    process.env.ES5
      ? bothBuilds(createHacsConfig, { isProdBuild: false })
      : createHacsConfig({ isProdBuild: false, latestBuild: true })
  ).watch({ poll: isWsl }, doneHandler());
  gulp.watch(path.join(paths.translations_src, "en.json"), gulp.series("generate-translations"));
});

gulp.task("webpack-prod-app", () =>
  prodBuild(
    bothBuilds(createHacsConfig, {
      isProdBuild: true,
      isStatsBuild: env.isStatsBuild(),
      isTestBuild: env.isTestBuild(),
    })
  )
);

module.exports = { createHacsConfig };
