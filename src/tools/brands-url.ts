import type { BrandsOptions } from "../../homeassistant-frontend/src/util/brands-url";
import { brandsUrl as haBrandsUrl } from "../../homeassistant-frontend/src/util/brands-url";
import type { RepositoryBase } from "../data/repository";

/**
 * Get the brand icon URL for a HACS repository.
 * For integrations with local brand icons (HA 2026.3.0+), returns the local path.
 * Otherwise falls back to the brands.home-assistant.io service.
 */
export const hacsBrandsUrl = (
  repository: RepositoryBase,
  options: Omit<BrandsOptions, "domain">
): string => {
  // For integrations installed via HACS, check if local brand icons exist
  if (repository.category === "integration" && repository.installed && repository.local_path) {
    // Local brand icons are at: {local_path}/brand/{type}.png
    // The local_path is relative to the HA config directory
    // Example: /config/custom_components/my_integration/brand/icon.png
    const localPath = repository.local_path.replace(/^\/config\//, "/local/");
    return `${localPath}/brand/${options.darkOptimized ? "dark_" : ""}${options.type}.png`;
  }

  // Fall back to brands service for:
  // - Non-installed integrations
  // - Integrations without local brand icons
  // - Non-integration repositories
  return haBrandsUrl({
    ...options,
    domain: repository.domain || "invalid",
  });
};
