import memoizeOne from "memoize-one";
import { Message, Repository } from "../data/common";
import { Hacs } from "../data/hacs";
import { addedToLovelace } from "./added-to-lovelace";

export const getMessages = memoizeOne((hacs: Hacs) => {
  const messages: Message[] = [];
  const repositoriesNotAddedToLovelace: Repository[] = [];
  const repositoriesRestartPending: Repository[] = [];

  hacs.repositories.forEach((repo) => {
    if (repo.status === "pending-restart") {
      repositoriesRestartPending.push(repo);
    }
    if (repo.installed && repo.category === "plugin" && !addedToLovelace(hacs, repo)) {
      repositoriesNotAddedToLovelace.push(repo);
    }
    if (repo.installed && hacs.removed.map((r) => r.repository)?.includes(repo.full_name)) {
      const removedrepo = hacs.removed.find((r) => r.repository === repo.full_name);
      messages.push({
        name: hacs
          .localize("entry.messages.removed")
          .replace("{repository}", removedrepo.repository),
        info: removedrepo.reason,
        severity: "error",
        dialog: "removed",
        repository: repo,
      });
    }
  });

  if (hacs.status?.startup && ["setup", "waiting", "startup"].includes(hacs.status.stage)) {
    messages.push({
      name: hacs.localize(`entry.messages.${hacs.status.stage}.title`),
      info: hacs.localize(`entry.messages.${hacs.status.stage}.content`),
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
      secondary: hacs.localize(`entry.messages.disabled.${hacs.status?.disabled_reason}.title`),
      info: hacs.localize(`entry.messages.disabled.${hacs.status?.disabled_reason}.description`),
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
        .replace("{number}", String(repositoriesRestartPending.length))
        .replace(
          "{pluralWording}",
          repositoriesRestartPending.length === 1
            ? hacs.localize("common.integration")
            : hacs.localize("common.integration_plural")
        ),
      severity: "error",
      path: "/config/server_control",
    });
  }

  return messages;
});
