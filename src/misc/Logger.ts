/*
Simple logger class to make logging consistent

Usage:

Basic: const logger = new Logger()
Advanced: const logger = new Logger("main")

logger.info("My message")
logger.error("My message")
logger.warning("My message")

const obj = {test: "string"}
logger.info(obj)

*/

export class Logger {
  section?: string;
  prefix?: string;
  constructor(section: string) {
    const name = "HACS";
    this.section = section;
    if (section === undefined) this.prefix = name;
    else this.prefix = `${name}.${section}`;
  }

  info(content: string | Object) {
    if (content instanceof Object) console.log(`[${this.prefix}] `, content);
    else console.log(`[${this.prefix}] ${content}`);
  }
  warning(content: string | Object) {
    if (content instanceof Object) console.warn(`[${this.prefix}] `, content);
    else console.warn(`[${this.prefix}] ${content}`);
  }
  error(content: string | Object) {
    if (content instanceof Object) console.error(`[${this.prefix}] `, content);
    else console.error(`[${this.prefix}] ${content}`);
  }
}
