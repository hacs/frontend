const gulp = require("gulp");
require("./common.js");

gulp.task(
  "develop",
  gulp.series(
    async function setEnv() {
      process.env.NODE_ENV = "development";
    },
    "common",
    "gen-dummy-icons-json",
    "rollup-develop"
  )
);
