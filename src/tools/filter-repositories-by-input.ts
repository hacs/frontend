import { Repository } from "../data/common";

export function filterRepositoriesByInput(
  repositories: Repository[],
  filter: string
): Repository[] {
  const _lowcaseFilter = stringify(filter);
  return repositories.filter(
    (_repo) =>
      stringify(_repo.name)?.includes(_lowcaseFilter) ||
      stringify(_repo.description)?.includes(_lowcaseFilter) ||
      stringify(_repo.category)?.includes(_lowcaseFilter) ||
      stringify(_repo.full_name)?.includes(_lowcaseFilter) ||
      stringify(_repo.authors)?.includes(_lowcaseFilter) ||
      stringify(_repo.domain)?.includes(_lowcaseFilter)
  );
}

const stringify = (str: any): string => {
  return String(str).toLocaleLowerCase().replace(/-|_| /g, "");
};
