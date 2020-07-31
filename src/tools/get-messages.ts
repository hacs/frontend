import memoizeOne from "memoize-one";
import { Message, Repository } from "../data/common";
import { version } from "../version";
import { Hacs } from "../data/hacs";
import { addedToLovelace } from "../tools/added-to-lovelace";

export const getMessages = memoizeOne((hacs: Hacs, repositories: Repository[]) => {
  const messages: Message[] = [];
  const repositoriesNotAddedToLovelace: Repository[] = [];
  const repositoriesRestartPending: Repository[] = [];

  repositories?.forEach((repo) => {
    if (repo.status === "pending-restart") {
      repositoriesRestartPending.push(repo);
    }
    if (repo.installed && repo.category === "plugin" && !addedToLovelace(hacs, repo)) {
      repositoriesNotAddedToLovelace.push(repo);
    }
    if (repo.installed && hacs.removed.map((r) => r.repository).includes(repo.full_name)) {
      const removedrepo = hacs.removed.find((r) => r.repository !== repo.full_name);
    }
  });

  if (
    hacs.configuration &&
    hacs.configuration.frontend_expected !== hacs.configuration.frontend_running
  ) {
    messages.push({
      name: hacs.localize("entry.messages.wrong_frontend_installed.title"),
      info: hacs
        .localize("entry.messages.wrong_frontend_installed.content")
        .replace("{running}", hacs.configuration.frontend_running)
        .replace("{expected}", hacs.configuration.frontend_expected),
      severity: "error",
    });
  } else if (hacs.configuration && hacs.configuration.frontend_expected !== version) {
    messages.push({
      name: hacs.localize("entry.messages.wrong_frontend_loaded.title"),
      info: hacs
        .localize("entry.messages.wrong_frontend_loaded.content")
        .replace("{running}", version)
        .replace("{expected}", hacs.configuration.frontend_expected),
      severity: "error",
    });
  }

  if (hacs.status?.startup) {
    messages.push({
      name: hacs.localize("entry.messages.startup.title"),
      info: hacs.localize("entry.messages.startup.content"),
      severity: "information",
    });
  }

  if (hacs.status?.has_pending_tasks) {
    messages.push({
      name: hacs.localize("entry.messages.has_pending_tasks.title"),
      info: hacs.localize("entry.messages.has_pending_tasks.content"),
      severity: "warning",
    });
  }

  if (hacs.status?.disabled) {
    messages.push({
      name: hacs.localize("entry.messages.disabled.title"),
      info: hacs.localize("entry.messages.disabled.content"),
      severity: "error",
    });
  }

  if (repositoriesNotAddedToLovelace.length > 0) {
    messages.push({
      name: hacs.localize("entry.messages.resources.title"),
      info: hacs
        .localize("entry.messages.resources.content")
        .replace("{number}", String(repositoriesNotAddedToLovelace.length)),
      severity: "error",
      path: "/hacs/frontend",
    });
  }

  if (repositoriesRestartPending.length > 0) {
    messages.push({
      name: hacs.localize("entry.messages.restart.title"),
      info: hacs
        .localize("entry.messages.restart.content")
        .replace("{number}", String(repositoriesRestartPending.length)),
      severity: "error",
      path: "/config/server_control",
    });
  }

  return messages;
});
