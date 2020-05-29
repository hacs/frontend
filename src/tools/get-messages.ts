import memoizeOne from "memoize-one";
import { Status, Message, Configuration } from "../data/common";
import { localize } from "../localize/localize";
import { version } from "../version";

export const getMessages = memoizeOne(
  (status: Status, configuration: Configuration) => {
    const messages: Message[] = [];
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
    return messages;
  }
);
