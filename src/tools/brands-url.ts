import type { HomeAssistant } from "../../homeassistant-frontend/src/types";

// Home Assistant 2026.3 moved brand images behind a local, token-gated proxy
// (`/api/brands/...`) that also serves the `brand/` assets custom integrations
// ship in their own folder. The pinned homeassistant-frontend predates that
// change, so this mirrors the relevant parts of its `src/util/brands-url.ts`.
// Once the submodule is bumped, this file can go and the import can point at
// the upstream module again.

export interface BrandsOptions {
  domain: string;
  type: "icon" | "logo" | "icon@2x" | "logo@2x";
  darkOptimized?: boolean;
}

// Core rotates the token every 30 minutes and keeps the previous one valid, so
// refreshing at the same cadence always leaves us with a working token.
const TOKEN_REFRESH_MS = 30 * 60 * 1000;

// After a core restart the WebSocket can accept connections before the brands
// handler is registered. Back off a few times, like the core frontend does.
const RETRY_DELAYS_MS = [500, 1000, 2000, 5000, 10000, 15000];

let _brandsAccessToken: string | undefined;
let _brandsRefreshInterval: ReturnType<typeof setInterval> | undefined;

const _fetchToken = async (hass: HomeAssistant): Promise<boolean> => {
  try {
    const { token } = await hass.connection.sendMessagePromise<{ token: string }>({
      type: "brands/access_token",
    });
    _brandsAccessToken = token;
    return true;
  } catch {
    // Core < 2026.3 has no brands proxy; the CDN stays in use.
    return false;
  }
};

export const fetchBrandsAccessToken = async (
  hass: HomeAssistant,
  { retry = false }: { retry?: boolean } = {},
): Promise<void> => {
  if ((await _fetchToken(hass)) || !retry) {
    return;
  }
  /* eslint-disable no-await-in-loop -- retries are intentionally sequential */
  for (const delay of RETRY_DELAYS_MS) {
    await new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
    if (await _fetchToken(hass)) {
      return;
    }
  }
  /* eslint-enable no-await-in-loop */
};

export const scheduleBrandsTokenRefresh = (hass: HomeAssistant): void => {
  clearBrandsTokenRefresh();
  _brandsRefreshInterval = setInterval(() => {
    fetchBrandsAccessToken(hass);
  }, TOKEN_REFRESH_MS);
};

export const clearBrandsTokenRefresh = (): void => {
  if (_brandsRefreshInterval) {
    clearInterval(_brandsRefreshInterval);
    _brandsRefreshInterval = undefined;
  }
};

export const brandsUrl = (options: BrandsOptions): string => {
  const image = `${options.darkOptimized ? "dark_" : ""}${options.type}.png`;

  if (!_brandsAccessToken) {
    // No proxy available: the CDN's `_/` path falls back to a placeholder.
    return `https://brands.home-assistant.io/_/${options.domain}/${image}`;
  }

  const url = new URL(`/api/brands/integration/${options.domain}/${image}`, location.origin);
  url.searchParams.set("token", _brandsAccessToken);
  return url.toString();
};
