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
        .replace("#./.yarn/patches/", "#./homeassistant-frontend/.yarn/patches/"),
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
