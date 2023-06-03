import { deleteSync } from "del";
import gulp from "gulp";
import path from "path";
import paths from "./paths.cjs";

gulp.task("clean", async () =>
  deleteSync([
    paths.app_output_root,
    paths.build_dir,
    path.resolve(paths.home_assistant_frontend_root, "build"),
  ])
);
