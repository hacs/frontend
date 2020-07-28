import { html, TemplateResult } from "lit-element";
import marked_ from "marked";
import DOMPurify from "dompurify";
import emoji from "node-emoji";
import hljs from "highlight.js/lib/core";
import yaml from "highlight.js/lib/languages/yaml";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";

import { Repository } from "../../data/common";
import { GFM, HLJS } from "./styles";

import "../../components/hacs-link";

hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);

const marked = marked_;

marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(lang, code, true).value;
    } else {
      return hljs.highlightAuto(code).value;
    }
  },
  breaks: true,
  gfm: true,
  tables: true,
  langPrefix: "",
});

export class markdown {
  static convert(input: string): string {
    return marked(input);
  }
  static html(input: string, repo?: Repository): TemplateResult | void {
    // Convert emoji short codes to real emojis
    input = emoji.emojify(input);

    // Handle convertion to raw GitHub URL
    input = input.replace(/(https:\/\/github\.com\/.*.\/blob*.[^\s]+)/g, function (x) {
      if (x.includes(".md")) {
        return x;
      }
      let url = x
        .replace("https://github.com/", "https://raw.githubusercontent.com/")
        .replace("/blob/", "/");
      return url;
    });

    // Handle relative links
    input = input.replace(/\!\[*.*\]\(\w*\.\w*\)/g, function (x) {
      let url = x
        .replace("(", `(https://raw.githubusercontent.com/${repo?.full_name}/master/`)
        .replace("/blob/", "/");
      return url;
    });
    const content = document.createElement("div");
    content.className = "markdown-body";
    content.innerHTML = DOMPurify.sanitize(marked(input), {
      css: false,
    }).replace(/\<a href="http\w:\/\/.*.\">.*.\<\/a>\W/g, function (x) {
      return x.replace(/<a href=/gm, "<hacs-link url=").replace(/<\/a>/gm, "</hacs-link>");
    });
    const style = document.createElement("style");
    style.innerText = `${HLJS}${GFM}`;

    return html`${style}${content} `;
  }
}
