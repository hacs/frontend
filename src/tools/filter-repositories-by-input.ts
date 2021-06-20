import memoizeOne from "memoize-one";
import { Repository } from "../data/common";

export const filterRepositoriesByInput = memoizeOne(
  (repositories: Repository[], filter: string): Repository[] =>
    repositories.filter(
      (_repo) =>
        stringify(_repo.name).includes(stringify(filter)) ||
        stringify(_repo.description).includes(stringify(filter)) ||
        stringify(_repo.category).includes(stringify(filter)) ||
        stringify(_repo.full_name).includes(stringify(filter)) ||
        stringify(_repo.authors).includes(stringify(filter)) ||
        stringify(_repo.domain).includes(stringify(filter))
    )
);

const stringify = memoizeOne((str?: any): string =>
  String(str || "")
    .toLocaleLowerCase()
    .replace(/-|_| /g, "")
);
