const gulp = require("gulp");
require("./common.js");

gulp.task(
  "build",
  gulp.series(
    async function setEnv() {
      process.env.NODE_ENV = "production";
    },
    "common",
    "rollup-build"
  )
);
