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
