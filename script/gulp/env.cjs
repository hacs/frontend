const haEnv = require("../../homeassistant-frontend/build-scripts/env.cjs");
const fs = require("fs-extra");
const paths = require("./paths.cjs");
const path = require("path");

const version = fs
  .readFileSync(path.resolve(paths.root_dir, "src/version.ts"), { encoding: "utf-8" })
  .split('"')[1];

haEnv.version = () => version;

module.exports = {
  ...haEnv,
  haFrontendVersion: () =>
    fs.readFileSync(path.resolve(paths.root_dir, ".git/modules/homeassistant-frontend/HEAD"), {
      encoding: "utf-8",
    }),
};
