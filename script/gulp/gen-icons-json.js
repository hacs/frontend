import fs from "fs";
import gulp from "gulp";
import path from "path";
import paths from "./paths.cjs";

gulp.task("gen-dummy-icons-json", (done) => {
  for (const output of [
    path.resolve(paths.build_dir, "mdi"),
    path.resolve(paths.home_assistant_frontend_root, "build/mdi"),
  ]) {
    if (!fs.existsSync(output)) {
      fs.mkdirSync(output, { recursive: true });
    }

    fs.writeFileSync(path.resolve(output, "iconList.json"), "[]");
  }

  done();
});
