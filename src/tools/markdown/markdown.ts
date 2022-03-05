import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import { html, TemplateResult } from "lit";
import marked_ from "marked";
import emoji from "node-emoji";
import "../../components/hacs-link";
import { Repository } from "../../data/common";
import { GFM, HLJS } from "./styles";

hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);

const marked = marked_;

marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true,
  tables: true,
  langPrefix: "",
});

export class markdown {
  static convert(input: string): string {
    return marked.parse(input);
  }

  static html(input: string, repo?: Repository): TemplateResult {
    // Convert emoji short codes to real emojis
    input = emoji.emojify(input);

    // Handle convertion to raw GitHub URL
    input = input.replace(/(https:\/\/github\.com\/.*.\/blob*.[^\s]+)/g, function (x) {
      if (x.includes(".md")) {
        return x;
      }
      return x
        .replace("https://github.com/", "https://raw.githubusercontent.com/")
        .replace("/blob/", "/");
    });

    // Handle relative links
    if (repo) {
      input = input.replace(/!\[*.*\]\((?!.*:\/\/).*\/*.*\.\w*\)/g, function (x) {
        return x
          .replace("(/", "(")
          .replace(
            "(",
            `(https://raw.githubusercontent.com/${repo.full_name}/${
              repo.available_version || repo.default_branch
            }/`
          )
          .replace("/blob/", "/");
      });
    }

    // Shorten commits links
    input = input.replace(
      /[^(]https:\/\/github\.com\/\S*\/commit\/([0-9a-f]{40})/g,
      (url, commit) => {
        const hash = commit.substr(0, 7);
        return `[\`${hash}\`](${url})`;
      }
    );

    // Add references to issues and PRs
    if (repo) {
      input = input.replace(/(?:\w[\w-.]+\/\w[\w-.]+|\B)#[1-9]\d*\b/g, (reference) => {
        const fullReference = reference.replace(/^#/, `${repo.full_name}#`);
        const [fullName, issue] = fullReference.split("#");
        return `[${reference}](https://github.com/${fullName}/issues/${issue})`;
      });
    }

    const content = document.createElement("div");
    content.className = "markdown-body";
    content.innerHTML = DOMPurify.sanitize(marked.parse(input), {
      css: false,
    }).replace(/\<a href="http\w:\/\/.*.\">.*.\<\/a>\W/g, function (x) {
      return x.replace(/<a href=/gm, "<hacs-link url=").replace(/<\/a>/gm, "</hacs-link>");
    });
    const style = document.createElement("style");
    style.innerText = `${HLJS}${GFM}`;

    return html`${style}${content} `;
  }
}
