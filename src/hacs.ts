import { LitElement, property } from "lit-element";
import { Hacs } from "./data/hacs";
import { sectionsEnabled, sections } from "./panels/hacs-sections";
import { addedToLovelace } from "./tools/added-to-lovelace";
import { HacsLogger } from "./tools/hacs-logger";
import { localize } from "./localize/localize";
import memoizeOne from "memoize-one";
import { Repository } from "./data/common";

export class HacsElement extends LitElement {
  @property({ type: Object }) public hacs?: Hacs;

  public async connectedCallback() {
    super.connectedCallback();

    this.addEventListener("update-hacs", (e) =>
      this._updateHacs((e as any).detail as Partial<Hacs>)
    );

    if (this.hacs === undefined) {
      const log = new HacsLogger();
      this.hacs = {
        language: "en",
        messages: [],
        updates: [],
        resources: [],
        repositories: [],
        removed: [],
        sections: [],
        configuration: {} as any,
        status: {} as any,
        addedToLovelace,
        localize: (string: string, search: string = undefined, replace: string = undefined) =>
          localize(this.hacs.language, string, search, replace),
        log,
      };
    }
  }

  protected _updateHacs(obj: Partial<Hacs>) {
    let shouldUpdate = false;

    Object.keys(obj).forEach((key) => {
      if (JSON.stringify(this.hacs[key]) !== JSON.stringify(obj[key])) {
        shouldUpdate = true;
      }
    });

    if (shouldUpdate) {
      this.hacs = { ...this.hacs, ...obj };
    }
  }

  private filterRepositories = memoizeOne((repositories: Repository[]): Repository[] => {
    repositories.forEach((repo) => {
      if (repo.country.length !== 0) {
        console.debug(repo);
      }
    });

    repositories = repositories.filter(
      (repo) => repo.country.length === 0 || repo.country.includes(this.hacs.configuration.country)
    );

    repositories = repositories.filter((repository) =>
      this.hacs.configuration.categories.includes(repository.category)
    );

    return repositories;
  });

  protected updated() {
    Object.keys(sections(this.hacs.language, this.hacs.repositories).sections).forEach(
      (section) => {
        this.hacs.sections[section] = sectionsEnabled(this.hacs, section);
      }
    );

    this.hacs.repositories = this.filterRepositories(this.hacs.repositories || []);
  }
}
