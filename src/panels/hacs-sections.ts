import { Route } from "../data/common";
import { mdiPuzzle, mdiPalette, mdiRobot } from "@mdi/js";
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
      },
      {
        categories: ["plugin", "theme"],
        iconPath: mdiPalette,
        id: "frontend",
        info: localize("sections.frontend.description"),
        name: localize("sections.frontend.title"),
        path: "/hacs/frontend",
      },
      {
        categories: ["python_script", "appdaemon", "netdaemon"],
        iconPath: mdiRobot,
        id: "automation",
        info: localize("sections.automation.description"),
        name: localize("sections.automation.title"),
        path: "/hacs/automations",
      },
    ],
  },
};

export const activePanel = (route: Route) => {
  console.log(route);
  return {
    iconPath: "mdi:robot",
    path: "/hacs/automations",
    id: "automation",
    categories: ["python_script", "appdaemon", "netdaemon"],
  };
};
