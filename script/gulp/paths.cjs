const path = require("path");
const haPaths = require("../../homeassistant-frontend/build-scripts/paths.cjs");

const hacsPaths = {
  home_assistant_frontend_root: path.resolve(__dirname, "../../homeassistant-frontend"),
  root_dir: path.resolve(__dirname, "../../"),
  source_dir: path.resolve(__dirname, "../../src"),
  build_dir: path.resolve(__dirname, "../../build"),

  app_output_root: path.resolve(__dirname, "../../hacs_frontend"),
  app_output_static: path.resolve(__dirname, "../../hacs_frontend/static"),
  app_output_latest: path.resolve(__dirname, "../../hacs_frontend/frontend_latest"),
  app_output_es5: path.resolve(__dirname, "../../hacs_frontend/frontend_es5"),

  app_publicPath: "/hacsfiles/frontend",

  translations_src: path.resolve(__dirname, "../../src/localize/languages"),
};

haPaths.build_dir = hacsPaths.build_dir;
haPaths.polymer_dir = hacsPaths.root_dir;
haPaths.translations_src = hacsPaths.translations_src;
haPaths.app_output_root = hacsPaths.app_output_root;
haPaths.app_output_static = hacsPaths.app_output_static;
haPaths.app_output_latest = hacsPaths.app_output_latest;
haPaths.app_output_es5 = hacsPaths.app_output_es5;

module.exports = hacsPaths;
