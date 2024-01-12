const path = require("path");
const paths = require("./paths.cjs");

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
        extra: path.resolve(paths.root_dir, "src/extra.ts"),
      },
      outputPath: outputPath(paths.app_output_root, latestBuild),
      publicPath: publicPath(latestBuild, paths.app_publicPath),
      isProdBuild,
      latestBuild,
      isStatsBuild,
      isTestBuild,
      defineOverlay: {
        __SUPERVISOR__: true,
        __STATIC_PATH__: `"${paths.app_publicPath}/static/"`,
      },
    };
  },
};
