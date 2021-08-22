const fs = require("fs");

let rawcore = fs.readFileSync("./homeassistant-frontend/package.json");
let rawhacs = fs.readFileSync("./package.json");

const core = JSON.parse(rawcore);
const hacs = JSON.parse(rawhacs);

fs.writeFileSync(
  "./package.json",
  JSON.stringify(
    {
      ...hacs,
      resolutions: { ...core.resolutions, ...hacs.resolutionsOverride },
      dependencies: { ...core.dependencies, ...hacs.dependenciesOverride },
      devDependencies: { ...core.devDependencies, ...hacs.devDependenciesOverride },
    },
    null,
    2
  )
);
