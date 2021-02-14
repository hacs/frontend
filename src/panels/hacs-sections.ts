import memoizeOne from "memoize-one";
import {
  mdiPuzzle,
  mdiPalette,
  mdiRobot,
  mdiPackageVariant,
  mdiNewBox,
  mdiViewDashboard,
  mdiRobotHappy,
  mdiRobotLove,
} from "@mdi/js";

import { Route } from "../../homeassistant-frontend/src/types";

import { Repository } from "../data/common";
import { localize } from "../localize/localize";
import { Hacs } from "../data/hacs";

export const sections = (language: string, repositories: Repository[]) => {
  return {
    updates: [],
    messages: [],
    sections: {
      dynamic: [
        {
          iconPath: mdiPackageVariant,
          id: "installed",
          class: "installed-icon",
          info: localize(language, "sections.dynamic.installed.description"),
          name: localize(language, "sections.dynamic.installed.title"),
          path: "/hacs/dynamic/installed",
          core: true,
        },
        {
          iconPath: mdiNewBox,
          id: "new",
          class: "new-icon",
          info: localize(language, "sections.dynamic.new.description"),
          name: localize(
            language,
            "sections.dynamic.new.title",
            "{number}",
            String(repositories?.filter((repo) => repo.new).length)
          ),
          path: "/hacs/dynamic/new",
          core: true,
        },
      ],
      core: [
        {
          iconPath: mdiPuzzle,
          id: "integration",
          info: localize(language, "sections.core.integration.description"),
          name: localize(language, "sections.core.integration.title"),
          path: "/hacs/core/integration",
          core: true,
        },
        {
          iconPath: mdiRobot,
          id: "python_script",
          info: localize(language, "sections.core.python_script.description"),
          name: localize(language, "sections.core.python_script.title"),
          path: "/hacs/core/python_script",
          core: true,
        },
      ],
      frontend: [
        {
          iconPath: mdiViewDashboard,
          id: "plugin",
          info: localize(language, "sections.frontend.plugin.description"),
          name: localize(language, "sections.frontend.plugin.title"),
          path: "/hacs/frontend/plugin",
          core: true,
        },
        {
          iconPath: mdiPalette,
          id: "theme",
          info: localize(language, "sections.frontend.theme.description"),
          name: localize(language, "sections.frontend.theme.title"),
          path: "/hacs/frontend/theme",
          core: true,
        },
      ],
      automation: [
        {
          iconPath: mdiRobotHappy,
          id: "appdaemon",
          info: localize(language, "sections.automation.appdaemon.description"),
          name: localize(language, "sections.automation.appdaemon.title"),
          path: "/hacs/automation/appdaemon",
          core: true,
        },
        {
          iconPath: mdiRobotLove,
          id: "netdaemon",
          info: localize(language, "sections.automation.netdaemon.description"),
          name: localize(language, "sections.automation.netdaemon.title"),
          path: "/hacs/automation/netdaemon",
          core: true,
        },
      ],
    },
  };
};

export const sectionsEnabled = memoizeOne((hacs: Hacs, section?: string) => {
  return sections(hacs.language, hacs.repositories).sections[section].filter((_section) => {
    if (_section.id === "new") {
      if (hacs.repositories.filter((repo) => !repo.installed && repo.new).length === 0) {
        return false;
      }
      return true;
    }

    if (_section.id === "installed") {
      return true;
    }

    return hacs.repositories.filter((repo) => repo.category === _section.id).length !== 0;
  });
});
