import { html, TemplateResult } from "lit-element";
import marked_ from "marked";
import { filterXSS } from "xss";
import emoji from "node-emoji";
import hljs_ from "highlight.js/lib/highlight";
import yaml_ from "highlight.js/lib/languages/yaml";
import { GFM, HLJS } from "./styles";
import { Repository } from "../types";

hljs_.registerLanguage("yaml", yaml_);

const hljs = hljs_,
  marked = marked_;

marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(lang, code, true).value;
    } else {
      return hljs.highlightAuto(code).value;
    }
  },
  breaks: true,
  gfm: true,
  tables: true,
  langPrefix: ""
});

export class markdown {
  static convert(input: string): string {
    return marked(input);
  }
  static html(input: string, repo: Repository): TemplateResult | void {
    // Convert emoji short codes to real emojis
    input = emoji.emojify(input);

    // Handle convertion to raw GitHub URL
    input = input.replace(
      /(https:\/\/github\.com\/.*.\/blob*.[^\s]+)/g,
      function(x) {
        let url = x
          .replace("https://github.com/", "https://raw.githubusercontent.com/")
          .replace("/blob/", "/");
        return url;
      }
    );

    // Handle relative links
    input = input.replace(/\!\[*.*\]\(\w*\.\w*\)/g, function(x) {
      let url = x
        .replace(
          "(",
          `(https://raw.githubusercontent.com/${repo.full_name}/master/`
        )
        .replace("/blob/", "/");
      return url;
    });
    const content = document.createElement("div");
    content.innerHTML = filterXSS(marked(input)).replace(
      /\<a href="http\w:\/\/.*.\">.*.\<\/a>\W/g,
      function(x) {
        return x
          .replace(/<a href=/gm, "<hacs-link url=")
          .replace(/<\/a>/gm, "</hacs-link>");
      }
    );
    content.style.cssText = `${GFM} ${HLJS}`;
    return html`
      ${content}
    `;
  }
}
