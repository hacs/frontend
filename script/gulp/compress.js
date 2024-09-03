// Tasks to compress
// Can not reuse HA compress.js untill min version is 2024.8

import gulp from "gulp";
import zopfli from "gulp-zopfli-green";
import paths from "./paths.cjs";

const zopfliOptions = { threshold: 150 };

const compressDist = (rootDir) =>
  gulp
    .src([`${rootDir}/**/*.{js,json,css,svg,xml}`, `${rootDir}/{authorize,onboarding}.html`])
    .pipe(zopfli(zopfliOptions))
    .pipe(gulp.dest(rootDir));

gulp.task("compress-app", () => compressDist(paths.app_output_root));
