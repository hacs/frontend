import { Repository, Configuration, Status, Message } from "./common";

export interface Hacs {
  language: string;
  messages: Message[];
  updates: any[];
  resources: any[];
  repositories: Repository[];
  removed: any[];
  configuration: Configuration;
  sections: any;
  status: Status;
  localize(string: string, replace?: Record<string, any>): string;
  addedToLovelace?(hacs: Hacs, repository: Repository): boolean;
  log: any;
}
