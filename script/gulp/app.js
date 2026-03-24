import gulp from "gulp";
import fs from "fs";
import path from "path";
import env from "./env.cjs";
import "./clean.js";
import "./compress.js";
import "./entry-html.js";
import "./gather-static.js";
import "../../homeassistant-frontend/build-scripts/gulp/gen-icons-json.js";
import "../../homeassistant-frontend/build-scripts/gulp/locale-data.js";
import "./paths.cjs";
import "./rspack.cjs";
import hacsPaths from "./paths.cjs";

// The upstream gen-dummy-icons-json writes iconList.json but not iconMetadata.json.
// The submodule's icon-metadata.ts imports iconMetadata.json with a relative path
// that resolves to homeassistant-frontend/build/mdi/. We need to write a dummy
// iconMetadata.json there so rspack can resolve it during the build.
const origDummyIcons = gulp.task("gen-dummy-icons-json");
gulp.task(
  "gen-dummy-icons-json",
  gulp.series(origDummyIcons, (done) => {
    const haBuildMdi = path.resolve(hacsPaths.home_assistant_frontend_root, "build", "mdi");
    if (!fs.existsSync(haBuildMdi)) {
      fs.mkdirSync(haBuildMdi, { recursive: true });
    }
    fs.writeFileSync(path.resolve(haBuildMdi, "iconMetadata.json"), '{"version":"dummy","parts":[]}');
    fs.writeFileSync(path.resolve(haBuildMdi, "iconList.json"), "[]");
    done();
  }),
);

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
    "rspack-watch-app",
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
    "rspack-prod-app",
    // Don't compress running tests
    ...(env.isTestBuild() ? [] : ["compress-app"]),
    "gen-pages-app-prod",
  ),
);
