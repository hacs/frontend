import fs from "fs";

let rawcore = fs.readFileSync("./homeassistant-frontend/package.json");
let rawhacs = fs.readFileSync("./package.json");

const core = JSON.parse(rawcore);
const hacs = JSON.parse(rawhacs);

fs.writeFileSync(
  ".yarnrc.yml",
  `
defaultSemverRangePrefix: ""

nodeLinker: node-modules

yarnPath: ./homeassistant-frontend/.yarn/releases/yarn-${core.packageManager.split("@")[1]}.cjs
`
);

fs.copyFileSync(
  `./homeassistant-frontend/.browserslistrc`,
  `.browserslistrc`
);

fs.copyFileSync(
  `./homeassistant-frontend/src/translations/translationMetadata.json`,
  `./src/localize/languages/translationMetadata.json`
);

fs.writeFileSync(
  "./package.json",
  JSON.stringify(
    {
      ...hacs,
      resolutions: { ...Object.fromEntries(
        Object.entries(core.resolutions).map(([key, val]) => [key, val.replace("#.yarn/patches/", "#./homeassistant-frontend/.yarn/patches/").replace("#./.yarn/patches/", "#./homeassistant-frontend/.yarn/patches/")]),
      ), ...hacs.resolutionsOverride },
      dependencies: { ...core.dependencies, ...hacs.dependenciesOverride },
      devDependencies: { ...core.devDependencies, ...hacs.devDependenciesOverride },
      packageManager: core.packageManager,
    },
    null,
    2
  )
);
