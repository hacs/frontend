import { Configuration } from "../data/common";
export const sections = {
  updates: [],
  panels: [
    {
      icon: "mdi:puzzle",
      id: "integrations",
      categories: ["integration"],
    },
    {
      icon: "mdi:palette",
      id: "frontend",
      categories: ["plugin", "theme"],
    },
    {
      icon: "mdi:robot",
      id: "automation",
      categories: ["python_script", "appdaemon", "netdaemon"],
    },
  ],
};

export const panelEnabled = (panel: string, config: Configuration) => {
  const categories = sections.panels.find((p) => p.id === panel).categories;
  if (categories === undefined) return true;
  const enabled = config?.categories;
  console.log(
    panel,
    categories.filter((c) => enabled.includes(c)).length !== 0
  );
  return categories.filter((c) => enabled.includes(c)).length !== 0;
};
