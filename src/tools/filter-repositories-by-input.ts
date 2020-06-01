import { Repository } from "../data/common";

export function filterRepositoriesByInput(repositories: Repository[], filter: string): Repository[] {
  return repositories.filter(
    (repo) =>
      repo.name?.toLocaleLowerCase().includes(filter) ||
      repo.description?.toLocaleLowerCase().includes(filter) ||
      repo.category.toLocaleLowerCase().includes(filter) ||
      repo.full_name.toLocaleLowerCase().includes(filter) ||
      String(repo.authors)?.toLocaleLowerCase().includes(filter) ||
      repo.domain?.toLocaleLowerCase().includes(filter)
  );
}
