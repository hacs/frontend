import gulp from "gulp";
import fs from "fs-extra";
import env from "./env.cjs";
import paths from "./paths.cjs";
import { createHash } from "crypto";
import path from "path";

const changeLang = { et_EE: "et", "zh-Hans": "zh_Hans", "pt-BR": "pt_BR" };
const ignoredLanguages = new Set(["es-419", "en-GB", "translationMetadata"]);
const fingerprints = {};

const translationMetadata = fs.readJSONSync(
  `${paths.translations_src}/translationMetadata.json`,
  "utf-8"
);

function recursiveFlatten(prefix, data) {
  let output = {};
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === "object") {
      output = {
        ...output,
        ...recursiveFlatten(prefix + key + ".", data[key]),
      };
    } else {
      output[prefix + key] = String(data[key]).replace(/'{/g, "''{").replace(/}'/g, "}''");
    }
  });
  return Object.fromEntries(Object.entries(output).sort());
}

gulp.task("generate-translations", async function (task) {
  await fs.mkdir(`${paths.build_dir}/translations`, { recursive: true });
  const defaultTranslation = recursiveFlatten(
    "",
    fs.readJSONSync(`${paths.translations_src}/en.json`, "utf-8")
  );

  for (const language of fs.readdirSync(paths.translations_src)) {
    const lang = language.split(".")[0];
    if (ignoredLanguages.has(language)) continue;
    const fileName = `${lang in changeLang ? changeLang[lang] : lang}.json`;
    const translation = { ...defaultTranslation };
    if (lang !== "en" && fs.existsSync(`${paths.translations_src}/${language}`)) {
      const fileTranslations = recursiveFlatten(
        "",
        fs.readJSONSync(`${paths.translations_src}/${language}`, "utf-8")
      );
      for (const key of Object.keys(fileTranslations)) {
        translation[key] = fileTranslations[key];
      }
    }
    await fs.writeFile(
      `${paths.build_dir}/translations/${fileName}`,
      JSON.stringify(translation, null),
      "utf-8"
    );
  }
  task();
});

gulp.task("build-translation-fingerprints", async (task) => {
  // Fingerprint full file of each language
  const fullDir = `${paths.build_dir}/translations`;

  for (const fileName of fs.readdirSync(fullDir)) {
    fingerprints[fileName.split(".")[0]] = {
      // In dev we create fake hashes
      hash: env.isProdBuild()
        ? createHash("md5")
            .update(fs.readFileSync(path.join(fullDir, fileName), "utf-8"))
            .digest("hex")
        : "dev",
    };
  }

  await fs.mkdir(`${paths.app_output_static}/translations/`, { recursive: true });
  await fs.mkdir(`${paths.home_assistant_frontend_root}/build/translations/`, { recursive: true });

  for (const fileName of fs.readdirSync(fullDir)) {
    if (fileName === "translationMetadata.json") continue;
    const parsed = path.parse(fileName);
    fs.copyFileSync(
      path.resolve(fullDir, fileName),
      `${paths.app_output_static}/translations/${parsed.name}-${fingerprints[parsed.name].hash}${
        parsed.ext
      }`
    );
  }

  const combined = {};

  for (const entry of Object.keys(fingerprints)) {
    combined[entry] = { ...translationMetadata[entry], ...fingerprints[entry] };
  }

  await fs.writeFile(
    `${paths.home_assistant_frontend_root}/build/translations/translationMetadata.json`,
    JSON.stringify({ translations: combined }, null),
    "utf-8"
  );
  task();
});
