/*@ts-ignore*/

import { html, TemplateResult } from 'lit-element';
import marked_ from 'marked';
import { filterXSS } from 'xss';

import hljs_ from 'highlight.js/lib/highlight';
import yaml_ from 'highlight.js/lib/languages/yaml';
import { GFM, HLJS } from './styles';

hljs_.registerLanguage('yaml', yaml_);

const hljs = hljs_,
  marked = marked_;

interface dict {
  [key: string]: string;
}

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
  langPrefix: '',
});

/**
@usage import {markdown} from './markdown'
**/
export class markdown {
  static html(input: string): TemplateResult | void {
    if (input.includes('---\n')) {
      var split: string[] = input.split('---\n');
      input = split.slice(2).join('---\n');
    }

    const content = document.createElement("div");
    content.innerHTML = filterXSS(marked(input))
    content.style.cssText = `${GFM} ${HLJS}`

    return html`${content}`
  }
}
