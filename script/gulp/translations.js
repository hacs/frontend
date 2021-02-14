const gulp = require("gulp");
const fs = require("fs-extra");
const del = require("del");
const log = require("fancy-log")

const changeLang = {"et_EE": "et", "zh-Hans": "zh_Hans", "pt-BR": "pt_BR"}

gulp.task("generate-translations", async function (task) {
  del.sync("./src/localize/generated.ts");
  const files = await fs.readdir("./src/localize/languages");
  const languages = {};
  files.forEach((file) => {
    let lang = file.split(".")[0];
    if (changeLang[lang]) {
      log(`Language code '${lang}' is wrong, using '${changeLang[lang]}'`)
      lang = changeLang[lang]
    }
    languages[lang] = fs.readJSONSync(`./src/localize/languages/${file}`, "utf-8");
    log(`Generating transtions for '${lang}'`)
  });
  await fs.writeFile(
    "./src/localize/generated.ts",
    "export const languages = " + JSON.stringify(languages, null, 2),
    "utf-8"
  );
  task();
});
