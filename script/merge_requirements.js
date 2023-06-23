import fs from "fs";

let rawcore = fs.readFileSync("./homeassistant-frontend/package.json");
let rawhacs = fs.readFileSync("./package.json");

const core = JSON.parse(rawcore);
const hacs = JSON.parse(rawhacs);

fs.mkdirSync(".yarn/releases", { recursive: true });
fs.readdirSync("./homeassistant-frontend/.yarn/releases").forEach((file) => {
  fs.copyFileSync(`./homeassistant-frontend/.yarn/releases/${file}`, `./.yarn/releases/${file}`);
});

fs.writeFileSync(
  ".yarnrc.yml",
  `
defaultSemverRangePrefix: ""

nodeLinker: node-modules

yarnPath: .yarn/releases/yarn-${core.packageManager.split("@")[1]}.cjs
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
      resolutions: { ...hacs.resolutionsOverride },
      dependencies: { ...core.dependencies, ...hacs.dependenciesOverride },
      devDependencies: { ...core.devDependencies, ...hacs.devDependenciesOverride },
      packageManager: core.packageManager,
    },
    null,
    2
  )
);
