import { Repository } from "../data/common";

export function filterRepositoriesByInput(repositories: Repository[], filter: string): Repository[] {
  const lowcaseFilter = filter.toLowerCase();
  return repositories.filter(
    (repo) =>
      repo.name?.toLocaleLowerCase().includes(lowcaseFilter) ||
      repo.description?.toLocaleLowerCase().includes(lowcaseFilter) ||
      repo.category.toLocaleLowerCase().includes(lowcaseFilter) ||
      repo.full_name.toLocaleLowerCase().includes(lowcaseFilter) ||
      String(repo.authors)?.toLocaleLowerCase().includes(lowcaseFilter) ||
      repo.domain?.toLocaleLowerCase().includes(lowcaseFilter)
  );
}
