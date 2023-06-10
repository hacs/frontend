import memoizeOne from "memoize-one";
import {
  mdiCodeBraces,
  mdiDotNet,
  mdiLanguagePython,
  mdiPackageVariant,
  mdiPalette,
  mdiRobot,
  mdiViewDashboard,
} from "@mdi/js";
import type { RepositoryCategory } from "../data/repository";

const _IconMap = {
  appdaemon: mdiRobot,
  integration: mdiPackageVariant,
  netdaemon: mdiDotNet,
  plugin: mdiViewDashboard,
  python_script: mdiLanguagePython,
  template: mdiCodeBraces,
  theme: mdiPalette,
};

export const categoryIcon = memoizeOne(
  (category: RepositoryCategory): string => _IconMap[category]
);
