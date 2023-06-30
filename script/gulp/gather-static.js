import fs from "fs-extra";
import gulp from "gulp";
import path from "path";
import paths from "./paths.cjs";

const haBuildPath = (...parts) =>
  path.resolve(paths.home_assistant_frontend_root, "build", ...parts);
const npmPath = (...parts) => path.resolve(paths.root_dir, "node_modules", ...parts);
const rootPath = (...parts) => path.resolve(paths.root_dir, ...parts);
const buildPath = (...parts) => path.resolve(paths.root_dir, "build", ...parts);

const genStaticPath =
  (staticDir) =>
  (...parts) =>
    path.resolve(staticDir, ...parts);

function copyLocaleData(staticDir) {
  const staticPath = genStaticPath(staticDir);

  fs.copySync(buildPath("locale-data"), staticPath("locale-data"));
}

function copyFonts(staticDir) {
  const staticPath = genStaticPath(staticDir);
  fs.copySync(npmPath("roboto-fontface/fonts/roboto/"), staticPath("fonts/roboto/"), {
    filter: (src) => !src.includes(".") || src.endsWith(".woff2"),
  });
}

gulp.task("copy-static-app", async () => {
  const staticDir = paths.app_output_static;
  fs.copySync(rootPath("public"), paths.app_output_root);
  fs.copySync(rootPath("public"), paths.app_output_root);
  fs.copySync(buildPath("mdi"), haBuildPath("mdi"));

  copyFonts(staticDir);
  copyLocaleData(staticDir);
});
