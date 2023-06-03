import { globIterate } from "glob";

const gulpImports = [];

for await (const gulpModule of globIterate(["./script/gulp/*.?(c|m)js"], {
  dotRelative: true,
})) {
  gulpImports.push(import(gulpModule));
}

await Promise.all(gulpImports);
