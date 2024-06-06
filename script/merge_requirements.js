import fs from "fs";

let rawcore = fs.readFileSync("./homeassistant-frontend/package.json");
let rawhacs = fs.readFileSync("./package.json");

const core = JSON.parse(rawcore);
const hacs = JSON.parse(rawhacs);

fs.writeFileSync(
  ".yarnrc.yml",
  `
compressionLevel: mixed

defaultSemverRangePrefix: ""

enableGlobalCache: false

nodeLinker: node-modules

yarnPath: ./homeassistant-frontend/.yarn/releases/yarn-${core.packageManager.split("@")[1]}.cjs
`,
);

fs.copyFileSync(`./homeassistant-frontend/.browserslistrc`, `.browserslistrc`);
fs.rmSync("./src/resources/polyfills", { recursive: true, force: true });
fs.mkdirSync("./src/resources/polyfills", { recursive: true });
for (const file of fs.readdirSync("./homeassistant-frontend/src/resources/polyfills", {
  recursive: true,
})) {
  fs.copyFileSync(
    `./homeassistant-frontend/src/resources/polyfills/${file}`,
    `./src/resources/polyfills/${file}`,
  );
}

const intlPolyfill = fs.readFileSync("./src/resources/polyfills/intl-polyfill.ts", {
  encoding: "utf-8",
});
fs.writeFileSync(
  "./src/resources/polyfills/intl-polyfill.ts",
  intlPolyfill.replace(
    "../../util/common-translation",
    "../../../homeassistant-frontend/src/util/common-translation",
  ),
  { encoding: "utf-8" },
);

fs.copyFileSync(
  `./homeassistant-frontend/src/translations/translationMetadata.json`,
  `./src/localize/languages/translationMetadata.json`,
);

const replacePatches = (deps) =>
  Object.fromEntries(
    Object.entries(deps).map(([key, val]) => [
      key,
      val
        .replace("#.yarn/patches/", "#./homeassistant-frontend/.yarn/patches/")
        .replace("#./.yarn/patches/", "#./homeassistant-frontend/.yarn/patches/")
        .replace("#~/.yarn/patches/", "#~/homeassistant-frontend/.yarn/patches/"),
    ]),
  );

fs.writeFileSync(
  "./package.json",
  JSON.stringify(
    {
      ...hacs,
      resolutions: {
        ...replacePatches(core.resolutions),
        ...hacs.resolutionsOverride,
      },
      dependencies: {
        ...replacePatches(core.dependencies),
        ...hacs.dependenciesOverride,
      },
      devDependencies: {
        ...replacePatches(core.devDependencies),
        ...hacs.devDependenciesOverride,
      },
      packageManager: core.packageManager,
    },
    null,
    2,
  ),
);
