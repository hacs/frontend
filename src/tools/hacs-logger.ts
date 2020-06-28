import { Configuration } from "../data/common";

export class HacsLogger {
  configuration: Configuration;
  prefix: string = "HACS";

  public info(log: any, prefix: string = "") {
    this.log(log, prefix);
  }

  public log(log: any, prefix: string = "") {
    const _prefix = prefix ? `[${this.prefix}:${prefix}] ` : `[${this.prefix}] `;
    console.log(_prefix, log);
  }

  public debug(log: any, prefix: string = "") {
    const _prefix = prefix ? `[${this.prefix}:${prefix}] ` : `[${this.prefix}] `;
    console.debug(_prefix, log);
  }
}
