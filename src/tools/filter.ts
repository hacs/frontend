import memoizeOne from "memoize-one";
import { Repository, Configuration } from "../data/common";

export const repositoriesInActiveCategory = memoizeOne(
  (repositories: Repository[], categories: string[]) =>
    repositories.filter((repo) => categories.includes(repo.category))
);

export const repositoriesInActiveSection = memoizeOne(
  (repositories: Repository[], sections: any, section: string) =>
    repositories?.filter(
      (repo) =>
        sections.panels
          .find((panel) => panel.id === section)
          .categories?.includes(repo.category) &&
        (repo.installed || repo.new)
    )
);

export const repositoriesInstalled = memoizeOne((repositories: Repository[]) =>
  repositories.filter((repo) => repo.installed)
);

export const panelEnabled = memoizeOne(
  (panel: string, sections: any, config: Configuration) => {
    const categories = sections.panels.find((p) => p.id === panel).categories;
    if (categories === undefined) return true;
    return (
      categories.filter((c) => config?.categories.includes(c)).length !== 0
    );
  }
);

export const panelsEnabled = memoizeOne(
  (sections: any, config: Configuration) => {
    return sections.panels.filter((panel) =>
      panelEnabled(panel.id, sections, config)
    );
  }
);
