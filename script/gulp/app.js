import gulp from "gulp";
import env from "./env.cjs";
import "./clean.js";
import "./compress.js";
import "./entry-html.js";
import "./gather-static.js";
import "../../homeassistant-frontend/build-scripts/gulp/gen-icons-json.js";
import "../../homeassistant-frontend/build-scripts/gulp/locale-data.js";
import "./paths.cjs";
import "./webpack.cjs";

gulp.task(
  "develop-hacs",
  gulp.series(
    async function setEnv() {
      process.env.NODE_ENV = "development";
    },
    "clean",
    gulp.parallel(
      "gen-dummy-icons-json",
      "gen-pages-app-dev",
      "build-locale-data",
      "generate-translations",
    ),
    "build-translation-fingerprints",
    "copy-static-app",
    "webpack-watch-app",
  ),
);

gulp.task(
  "build-hacs",
  gulp.series(
    async function setEnv() {
      process.env.NODE_ENV = "production";
    },
    "clean",
    gulp.parallel("gen-dummy-icons-json", "build-locale-data", "generate-translations"),
    "build-translation-fingerprints",
    "copy-static-app",
    "webpack-prod-app",
    // Don't compress running tests
    ...(env.isTestBuild() ? [] : ["compress-app"]),
    "gen-pages-app-prod",
  ),
);
