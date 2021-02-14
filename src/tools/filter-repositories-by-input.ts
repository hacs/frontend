import { Repository } from "../data/common";

export function filterRepositoriesByInput(
  repositories: Repository[],
  filter: string
): Repository[] {
  const _lowcaseFilter = stringify(filter);
  return repositories.filter(
    (repo) =>
      stringify(repo.name)?.includes(_lowcaseFilter) ||
      stringify(repo.description)?.includes(_lowcaseFilter) ||
      stringify(repo.category)?.includes(_lowcaseFilter) ||
      stringify(repo.full_name)?.includes(_lowcaseFilter) ||
      stringify(repo.authors)?.includes(_lowcaseFilter) ||
      stringify(repo.domain)?.includes(_lowcaseFilter) ||
      stringify(repo.country)?.includes(_lowcaseFilter)
  );
}

const stringify = (str: any): string => {
  return String(str).toLocaleLowerCase().replace(/-|_| /g, "");
};
