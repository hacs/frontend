import {
  mdiDotNet,
  mdiLanguagePython,
  mdiPackageVariant,
  mdiPalette,
  mdiRobot,
  mdiViewDashboard,
} from "@mdi/js";
import { RepositoryCategory } from "../data/repository";

const _IconMap = {
  appdaemon: mdiRobot,
  integration: mdiPackageVariant,
  netdaemon: mdiDotNet,
  plugin: mdiViewDashboard,
  python_script: mdiLanguagePython,
  theme: mdiPalette,
};

export const categoryIcon = (category: RepositoryCategory): string => _IconMap[category];
