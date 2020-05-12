export const sections = {
  updates: [],
  panels: [
    {
      title: "Integrations",
      description: "This is where you find custom component/integrations",
      icon: "mdi:puzzle",
      id: "integrations",
      categories: ["integration"],
    },
    {
      title: "Frontend",
      description: "This is where you find lovelace elements and themes",
      icon: "mdi:palette",
      id: "frontend",
      categories: ["plugin", "theme"],
    },
    {
      title: "Automation",
      description:
        "This is where you find python_scripts, AppDaemon apps and NetDaemon apps",
      icon: "mdi:robot",
      id: "automation",
      categories: ["python_script", "appdaemon", "netdaemon"],
    },
    {
      title: "Settings",
      description: "This is where you can manage HACS",
      icon: "mdi:cogs",
      id: "settings",
    },
  ],
};
