var gulp = require("gulp"),
  browserSync = require("browser-sync");

// Сервер
gulp.task("server", function () {
  browserSync({
    port: 5000,
    server: {
      baseDir: "hacs_frontend",
    },
  });
});

// Слежка
gulp.task("watch", function () {
  gulp.watch(["src/*.ts", "src/**/*.ts"]).on("change", browserSync.reload);
});

// Задача по-умолчанию
gulp.task("default", ["server", "watch"]);
