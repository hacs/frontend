const gulp = require("gulp");
const del = require("del");
const fs = require("fs-extra");
const makeDir = require("make-dir");
require("./rollup.js");
require("./translations");

gulp.task("cleanup", (task) => {
  del.sync(["./homeassistant-frontend/build/**", "./homeassistant-frontend/build"]);
  del.sync("./hacs_frontend/main.js");
  task();
});

gulp.task("create-icon-metadata", async function (task) {
  await makeDir("./homeassistant-frontend/build/mdi");
  await fs.outputJson("./homeassistant-frontend/build/mdi/iconMetadata.json", {
    version: "0",
    parts: [],
  });
  task();
});

gulp.task("common", gulp.series("cleanup", "create-icon-metadata", "generate-translations"));
