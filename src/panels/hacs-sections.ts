import memoizeOne from "memoize-one";
import { mdiPuzzle, mdiPalette, mdiRobot } from "@mdi/js";

import { Route } from "../../homeassistant-frontend/src/types";

import { Configuration } from "../data/common";
import { localize } from "../localize/localize";

export const sections = (language: string) => {
  return {
    updates: [],
    messages: [],
    subsections: {
      main: [
        {
          categories: ["integration"],
          iconPath: mdiPuzzle,
          id: "integrations",
          info: localize(language, "sections.integrations.description"),
          name: localize(language, "sections.integrations.title"),
          path: "/hacs/integrations",
          core: true,
        },
        {
          categories: ["plugin", "theme"],
          iconPath: mdiPalette,
          id: "frontend",
          info: localize(language, "sections.frontend.description"),
          name: localize(language, "sections.frontend.title"),
          path: "/hacs/frontend",
          core: true,
        },
        {
          categories: ["python_script", "appdaemon", "netdaemon"],
          iconPath: mdiRobot,
          id: "automation",
          info: localize(language, "sections.automation.description"),
          name: localize(language, "sections.automation.title"),
          path: "/hacs/automation",
          core: true,
        },
      ],
    },
  };
};

export const sectionsEnabled = memoizeOne((language: string, config: Configuration) => {
  return sections(language).subsections.main.filter((section) => {
    const categories = section.categories;
    return categories?.filter((category) => config?.categories?.includes(category)).length !== 0;
  });
});

export const activePanel = (language: string, route: Route) => {
  const section = route.path.replace("/", "");
  return sections(language).subsections.main.find((panel) => panel.id == section);
};
