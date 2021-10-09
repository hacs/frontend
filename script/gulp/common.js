const gulp = require("gulp");
const del = require("del");
require("./rollup.js");
require("./translations");

gulp.task("cleanup", (task) => {
  del.sync(["./homeassistant-frontend/build/**", "./homeassistant-frontend/build"]);
  del.sync(["./hacs_frontend/*.js", "./hacs_frontend/*.json", "./hacs_frontend/*.gz"]);
  task();
});

gulp.task("common", gulp.series("cleanup", "generate-translations"));
