import memoizeOne from "memoize-one";
import { html } from "lit-element";
import {
  Status,
  Message,
  Configuration,
  LovelaceResource,
  Repository,
  RemovedRepository,
} from "../data/common";
import { localize } from "../localize/localize";
import { version } from "../version";
import { addedToLovelace } from "../tools/added-to-lovelace";

export const getMessages = memoizeOne(
  (
    status: Status,
    configuration: Configuration,
    resources: LovelaceResource[],
    repositories: Repository[],
    removed: RemovedRepository[]
  ) => {
    const messages: Message[] = [];
    const repositoriesNotAddedToLovelace: Repository[] = [];
    const repositoriesRestartPending: Repository[] = [];

    repositories?.forEach((repo) => {
      if (repo.status === "pending-restart") {
        repositoriesRestartPending.push(repo);
      }
      if (
        repo.installed &&
        repo.category === "plugin" &&
        !addedToLovelace(resources, configuration, repo)
      ) {
        repositoriesNotAddedToLovelace.push(repo);
      }
      if (repo.installed && removed.map((r) => r.repository).includes(repo.full_name)) {
        const removedrepo = removed.find((r) => r.repository !== repo.full_name);
      }
    });

    if (configuration.frontend_expected !== configuration.frontend_running) {
      messages.push({
        title: localize("entry.messages.wrong_frontend_installed.title"),
        content: localize("entry.messages.wrong_frontend_installed.content")
          .replace("{running}", configuration.frontend_running)
          .replace("{expected}", configuration.frontend_expected),
        severity: "error",
      });
    } else if (configuration.frontend_expected !== version) {
      messages.push({
        title: localize("entry.messages.wrong_frontend_loaded.title"),
        content: localize("entry.messages.wrong_frontend_loaded.content")
          .replace("{running}", version)
          .replace("{expected}", configuration.frontend_expected),
        severity: "error",
      });
    }

    if (status?.startup) {
      messages.push({
        title: localize("entry.messages.startup.title"),
        content: localize("entry.messages.startup.content"),
        severity: "information",
      });
    }

    if (status?.has_pending_tasks) {
      messages.push({
        title: localize("entry.messages.has_pending_tasks.title"),
        content: localize("entry.messages.has_pending_tasks.content"),
        severity: "warning",
      });
    }

    if (status?.disabled) {
      messages.push({
        title: localize("entry.messages.disabled.title"),
        content: localize("entry.messages.disabled.content"),
        severity: "error",
      });
    }

    if (repositoriesNotAddedToLovelace.length > 0) {
      messages.push({
        title: localize("entry.messages.resources.title"),
        content: localize("entry.messages.resources.content").replace(
          "{number}",
          repositoriesNotAddedToLovelace.length
        ),
        severity: "error",
        path: "/hacs/frontend",
      });
    }

    if (repositoriesRestartPending.length > 0) {
      messages.push({
        title: localize("entry.messages.restart.title"),
        content: localize("entry.messages.restart.content").replace(
          "{number}",
          repositoriesRestartPending.length
        ),
        severity: "error",
        path: "/config/server_control",
      });
    }

    return messages;
  }
);
