import {
  LitElement,
  customElement,
  CSSResultArray,
  css,
  TemplateResult,
  html,
  property
} from "lit-element";

@customElement("multi-spinner")
export class Spinner extends LitElement {
  @property() public primary: string = "#faa179";
  @property() public secondary: string = "black";
  @property() public active: boolean = false;

  protected render(): TemplateResult | void {
    if (!this.active) return html``;
    return html`
          <svg class="spin spinner13" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
            <circle class="stroke stroke30" fill="transparent" stroke-width="1" cx="33" cy="33" r="30" stroke="red"/>
            </circle>
          </svg>
          <svg class="spin reversespinner13" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
            <circle class="stroke stroke25" fill="transparent" stroke-width="1" cx="33" cy="33" r="25" stroke="blue"/>
            </circle>
          </svg>
          <svg class="spin spinner14" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
            <circle class="stroke stroke20" fill="transparent" stroke-width="1" cx="33" cy="33" r="20" stroke="red"/>
            </circle>
          </svg>
          <svg class="spin reversespinner14" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
            <circle class="stroke stroke15" fill="transparent" stroke-width="1" cx="33" cy="33" r="15" stroke="blue"/>
            </circle>
          </svg>
          <svg class="spin spinner15" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
            <circle class="stroke stroke10" fill="transparent" stroke-width="1" cx="33" cy="33" r="10" stroke="red"/>
            </circle>
          </svg>
          <svg class="spin reversespinner15" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
            <circle class="stroke stroke5" fill="transparent" stroke-width="1" cx="33" cy="33" r="5" stroke="blue"/>
            </circle>
          </svg>
    `;
  }

  static get styles(): CSSResultArray {
    return [
      css`
        .stroke {
          stroke-dasharray: 200;
        }
        .stroke30 {
          stroke-dashoffset: 50;
        }
        .stroke25 {
          stroke-dashoffset: 75;
        }
        .stroke20 {
          stroke-dashoffset: 100;
        }
        .stroke15 {
          stroke-dashoffset: 125;
        }
        .stroke10 {
          stroke-dashoffset: 150;
        }
        .stroke5 {
          stroke-dashoffset: 175;
        }

        .spin {
          position: absolute;
          z-index: 1337;
          width: auto;
        }

        .spinner13 {
          animation: rotate 1.3s linear infinite;
          -webkit-animation: rotate 1.3s linear infinite;
          -moz-animation: rotate 1.3s linear infinite;
        }

        .reversespinner13 {
          animation: reverserotate 1.3s linear infinite;
          -webkit-animation: reverserotate 1.3s linear infinite;
          -moz-animation: reverserotate 1.3s linear infinite;
        }

        .spinner14 {
          animation: rotate 1.4s linear infinite;
          -webkit-animation: rotate 1.4s linear infinite;
          -moz-animation: rotate 1.4s linear infinite;
        }

        .reversespinner14 {
          animation: reverserotate 1.4s linear infinite;
          -webkit-animation: reverserotate 1.4s linear infinite;
          -moz-animation: reverserotate 1.4s linear infinite;
        }

        .spinner15 {
          animation: rotate 1.5s linear infinite;
          -webkit-animation: rotate 1.5s linear infinite;
          -moz-animation: rotate 1.5s linear infinite;
        }

        .reversespinner15 {
          animation: reverserotate 1.5s linear infinite;
          -webkit-animation: reverserotate 1.5s linear infinite;
          -moz-animation: reverserotate 1.5s linear infinite;
        }

        @keyframes rotate {
          to {
            transform: rotate(360deg);
          }
        }

        @-webkit-keyframes rotate {
          to {
            -webkit-transform: rotate(360deg);
          }
        }

        @-moz-keyframes rotate {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes reverserotate {
          to {
            transform: rotate(-360deg);
          }
        }

        @-webkit-keyframes reverserotate {
          to {
            -webkit-transform: rotate(-360deg);
          }
        }

        @-moz-keyframes reverserotate {
          to {
            transform: rotate(-360deg);
          }
        }
      `
    ];
  }
}
