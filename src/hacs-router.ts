import { customElement, property, state } from "lit/decorators";
import { listenMediaQuery } from "../homeassistant-frontend/src/common/dom/media_query";
import {
  HassRouterPage,
  RouterOptions,
} from "../homeassistant-frontend/src/layouts/hass-router-page";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";

import { Hacs } from "./data/hacs";

@customElement("hacs-router")
class HacsRouter extends HassRouterPage {
  @property({ attribute: false }) public hacs?: Hacs;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public route!: Route;

  @property({ type: Boolean }) public narrow!: boolean;

  @state() private _wideSidebar = false;

  @state() private _wide = false;

  private _listeners: Array<() => void> = [];

  public connectedCallback() {
    super.connectedCallback();
    this._listeners.push(
      listenMediaQuery("(min-width: 1040px)", (matches) => {
        this._wide = matches;
      })
    );
    this._listeners.push(
      listenMediaQuery("(min-width: 1296px)", (matches) => {
        this._wideSidebar = matches;
      })
    );

    this.style.setProperty("--app-header-background-color", "var(--sidebar-background-color)");
    this.style.setProperty("--app-header-text-color", "var(--sidebar-text-color)");
    this.style.setProperty("--app-header-border-bottom", "1px solid var(--divider-color)");
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    while (this._listeners.length) {
      this._listeners.pop()!();
    }
  }

  protected routerOptions: RouterOptions = {
    defaultPage: "entry",
    routes: {
      entry: {
        tag: "hacs-entry-panel",
        load: () => import("./panels/hacs-entry-panel"),
      },
      integrations: {
        tag: "hacs-store-panel",
        load: () => import("./panels/hacs-store-panel"),
      },
      frontend: {
        tag: "hacs-store-panel",
        load: () => import("./panels/hacs-store-panel"),
      },
      automation: {
        tag: "hacs-store-panel",
        load: () => import("./panels/hacs-store-panel"),
      },
    },
  };

  protected updatePageEl(el) {
    const section = this.route.path.replace("/", "");
    const isWide = this.hass.dockedSidebar === "docked" ? this._wideSidebar : this._wide;
    el.hass = this.hass;
    el.hacs = this.hacs;
    el.route = this.route;
    el.narrow = this.narrow;
    el.isWide = isWide;
    el.section = section;
  }
}
