const gulp = require("gulp");
const fs = require("fs-extra");
const del = require("del");

gulp.task("generate-translations", async function (task) {
  del.sync("./src/localize/generated.ts");
  const files = await fs.readdir("./src/localize/languages");
  const languages = {};
  files.forEach((file) => {
    const lang = file.split(".")[0];
    languages[lang] = fs.readJSONSync(`./src/localize/languages/${file}`, "utf-8");
  });
  await fs.writeFile(
    "./src/localize/generated.ts",
    "export const languages = " + JSON.stringify(languages, null, 2),
    "utf-8"
  );
  task();
});
