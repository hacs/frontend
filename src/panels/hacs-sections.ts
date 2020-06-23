import memoizeOne from "memoize-one";
import { mdiPuzzle, mdiPalette, mdiRobot } from "@mdi/js";

import { Route } from "../../homeassistant-frontend/src/types";

import { Configuration } from "../data/common";
import { localize } from "../localize/localize";

export const sections = {
  updates: [],
  messages: [],
  subsections: {
    main: [
      {
        categories: ["integration"],
        iconPath: mdiPuzzle,
        id: "integrations",
        info: localize("sections.integrations.description"),
        name: localize("sections.integrations.title"),
        path: "/hacs/integrations",
        core: true,
      },
      {
        categories: ["plugin", "theme"],
        iconPath: mdiPalette,
        id: "frontend",
        info: localize("sections.frontend.description"),
        name: localize("sections.frontend.title"),
        path: "/hacs/frontend",
        core: true,
      },
      {
        categories: ["python_script", "appdaemon", "netdaemon"],
        iconPath: mdiRobot,
        id: "automation",
        info: localize("sections.automation.description"),
        name: localize("sections.automation.title"),
        path: "/hacs/automation",
        core: true,
      },
    ],
  },
};

export const sectionsEnabled = memoizeOne((config: Configuration) => {
  return sections.subsections.main.filter((section) => {
    const categories = section.categories;
    if (categories === undefined) return true;
    if (config === undefined) return true;
    if (config.categories === undefined) return true;
    return categories.filter((category) => config.categories.includes(category)).length !== 0;
  });
});

export const activePanel = (route: Route) => {
  console.log(route);
  return {
    categories: ["python_script", "appdaemon", "netdaemon"],
    iconPath: mdiRobot,
    id: "automation",
    info: localize("sections.automation.description"),
    name: localize("sections.automation.title"),
    path: "/hacs/automation",
    core: true,
  };
};
