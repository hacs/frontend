import fs from "fs";

let rawcore = fs.readFileSync("./homeassistant-frontend/src/translations/en.json");
let rawhacs = fs.readFileSync("./src/localize/languages/en.json");

const core = JSON.parse(rawcore);
const hacs = JSON.parse(rawhacs);

fs.writeFileSync(
  "./src/localize/languages/en.json",
  JSON.stringify(
    {
      ...hacs,
      ui: {
        components: {
          ["subpage-data-table"]: core.ui.components["subpage-data-table"],
        },
      },
    },
    null,
    2,
  ),
);
