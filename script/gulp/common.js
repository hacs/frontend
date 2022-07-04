const gulp = require("gulp");
const del = require("del");
const fs = require("fs");
const path = require("path");

require("./rollup.js");
require("./translations");

gulp.task("gen-dummy-icons-json", (done) => {
  if (!fs.existsSync("./homeassistant-frontend/build/mdi")) {
    fs.mkdirSync("./homeassistant-frontend/build/mdi", { recursive: true });
  }

  fs.writeFileSync(path.resolve("./homeassistant-frontend/build/mdi", "iconList.json"), "[]");
  done();
});

gulp.task("cleanup", (task) => {
  del.sync(["./homeassistant-frontend/build/**", "./homeassistant-frontend/build"]);
  del.sync(["./hacs_frontend/*.js", "./hacs_frontend/*.json", "./hacs_frontend/*.gz"]);
  task();
});

gulp.task("common", gulp.series("cleanup", "generate-translations"));
