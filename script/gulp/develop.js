const gulp = require("gulp");
const path = require("path");
require("./rollup.js");

gulp.task(
  "develop",
  gulp.series(async function setEnv() {
    process.env.NODE_ENV = "development";
  }, "rollup-watch-app")
);
