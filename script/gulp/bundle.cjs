const path = require("path");
const paths = require("./paths.cjs");

const haBundle = require("../../homeassistant-frontend/build-scripts/bundle.cjs");

module.exports.ignorePackages = ({ latestBuild }) => haBundle.ignorePackages({ latestBuild });
module.exports.htmlMinifierOptions = haBundle.htmlMinifierOptions;
module.exports.terserOptions = ({ latestBuild, isTestBuild }) =>
  haBundle.terserOptions({ latestBuild, isTestBuild });

// Files from NPM packages that we should replace with empty file
module.exports.emptyPackages = ({ latestBuild }) =>
  [
    // Contains all color definitions for all material color sets.
    // We don't use it
    require.resolve("@polymer/paper-styles/color.js"),
    require.resolve("@polymer/paper-styles/default-theme.js"),
    // Loads stuff from a CDN
    require.resolve("@polymer/font-roboto/roboto.js"),
    require.resolve("@vaadin/vaadin-material-styles/typography.js"),
    require.resolve("@vaadin/vaadin-material-styles/font-icons.js"),
    // Compatibility not needed for latest builds
    latestBuild &&
      // wrapped in require.resolve so it blows up if file no longer exists
      require.resolve(
        path.resolve(paths.home_assistant_frontend_root, "src/resources/compatibility.ts")
      ),
    // This polyfill is loaded in workers to support ES5, filter it out.
    latestBuild && require.resolve("proxy-polyfill/src/index.js"),
    // Icons in supervisor conflict with icons in HA so we don't load.
    require.resolve(path.resolve(paths.home_assistant_frontend_root, "src/components/ha-icon.ts")),
    require.resolve(
      path.resolve(paths.home_assistant_frontend_root, "src/components/ha-icon-picker.ts")
    ),
  ].filter(Boolean);

module.exports.definedVars = ({ isProdBuild, latestBuild }) => ({
  ...haBundle.definedVars({ isProdBuild, latestBuild }),
  // While this is not the supervisor, it functions in the same maner and we use this to signal components to behave differently.
  __SUPERVISOR__: true,
  __STATIC_PATH__: `"${paths.app_publicPath}/static/"`,
});

module.exports.babelOptions = ({ latestBuild, isProdBuild, isTestBuild }) => ({
  ...haBundle.babelOptions({ latestBuild, isProdBuild, isTestBuild }),
  plugins: [
    [
      path.resolve(
        paths.home_assistant_frontend_root,
        "build-scripts/babel-plugins/inline-constants-plugin.cjs"
      ),
      {
        modules: ["@mdi/js"],
        ignoreModuleNotFound: true,
      },
    ],
    // Minify template literals for production
    isProdBuild && [
      "template-html-minifier",
      {
        modules: {
          lit: [
            "html",
            { name: "svg", encapsulation: "svg" },
            { name: "css", encapsulation: "style" },
          ],
          "@polymer/polymer/lib/utils/html-tag": ["html"],
        },
        strictCSS: true,
        htmlMinifier: module.exports.htmlMinifierOptions,
        failOnError: true, // we can turn this off in case of false positives
      },
    ],
    // Import helpers and regenerator from runtime package
    [
      "@babel/plugin-transform-runtime",
      {
        version: require(path.resolve(paths.root_dir, "package.json")).dependencies[
          "@babel/runtime"
        ],
      },
    ],
    // Support  some proposals still in TC39 process
    ["@babel/plugin-proposal-decorators", { decoratorsBeforeExport: true }],
  ].filter(Boolean),
});

const nameSuffix = (latestBuild) => (latestBuild ? "-latest" : "-es5");

const outputPath = (outputRoot, latestBuild) =>
  path.resolve(outputRoot, latestBuild ? "frontend_latest" : "frontend_es5");

const publicPath = (latestBuild, root = "") =>
  latestBuild ? `${root}/frontend_latest/` : `${root}/frontend_es5/`;

module.exports.config = {
  hacs({ isProdBuild, latestBuild, isStatsBuild, isTestBuild }) {
    return {
      name: "hacs" + nameSuffix(latestBuild),
      entry: {
        entrypoint: path.resolve(paths.root_dir, "src/entrypoint.ts"),
      },
      outputPath: outputPath(paths.app_output_root, latestBuild),
      publicPath: publicPath(latestBuild, paths.app_publicPath),
      isProdBuild,
      latestBuild,
      isStatsBuild,
      isTestBuild,
    };
  },
};
