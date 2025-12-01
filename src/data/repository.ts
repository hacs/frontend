import type { HomeAssistant } from "../../homeassistant-frontend/src/types";

/**
 * Extract base language code from BCP47 language format.
 * Examples: "de-DE" -> "de", "en-US" -> "en", "fr" -> "fr"
 * @param language - BCP47 language code (e.g., "de-DE", "en-US", "fr")
 * @returns Base language code in lowercase (e.g., "de", "en", "fr")
 */
export const getBaseLanguageCode = (language: string | undefined): string => {
  if (!language) {
    return "en";
  }
  return language.split("-")[0].toLowerCase();
};

/**
 * Check if backend supports language parameter for multilingual README.
 * This is cached per session to avoid repeated failed requests.
 */
let backendSupportsLanguage: boolean | null = null;

/**
 * Promise that tracks the ongoing request to determine backend language support.
 * This prevents race conditions when multiple concurrent requests try to determine
 * backend support simultaneously.
 */
let backendSupportCheckPromise: Promise<void> | null = null;

/**
 * Reset the backend language support cache.
 * Useful for testing or when backend is updated.
 */
export const resetBackendLanguageSupportCache = () => {
  backendSupportsLanguage = null;
  backendSupportCheckPromise = null;
};

export type RepositoryType =
  | "appdaemon"
  | "integration"
  | "netdaemon"
  | "plugin"
  | "python_script"
  | "template"
  | "theme";

export interface RepositoryBase {
  authors: string[];
  available_version: string;
  can_download: boolean;
  category: RepositoryType;
  config_flow: boolean;
  country: string[];
  custom: boolean;
  description: string;
  domain: string | null;
  downloads: number;
  file_name: string;
  full_name: string;
  hide: boolean;
  homeassistant: string | null;
  id: string;
  installed_version: string;
  installed: boolean;
  last_updated: string;
  local_path: string;
  name: string;
  new: boolean;
  pending_upgrade: boolean;
  stars: number;
  state: string;
  status: "pending-restart" | "pending-upgrade" | "new" | "installed" | "default";
  topics: string[];
}

export interface RepositoryInfo extends RepositoryBase {
  additional_info: string;
  default_branch: string;
  hide_default_branch: boolean;
  issues: number;
  releases: string[];
  ref: string;
  selected_tag: string | null;
  version_or_commit: "version" | "commit";
}

/**
 * Fetch repository information from HACS backend.
 * Supports multilingual README files based on Home Assistant language setting.
 * 
 * This function works for both custom and standard integrations:
 * - Custom Integration: Works with HACS custom integration
 * - Standard Integration: Works when HACS becomes a standard Home Assistant integration
 * 
 * The language parameter is optional and backward compatible:
 * - If the backend doesn't support the language parameter, it will return the default README.md
 * - If the backend supports it, it will return the language-specific README (e.g., README.de.md)
 * 
 * @param hass - Home Assistant instance
 * @param repositoryId - Repository ID
 * @param language - Optional language override (defaults to hass.language)
 * @returns Repository information with additional_info (README content)
 */
export const fetchRepositoryInformation = async (
  hass: HomeAssistant,
  repositoryId: string,
  language?: string,
): Promise<RepositoryInfo | undefined> => {
  // Get language from parameter or hass.language
  const languageToUse = language ?? hass.language;
  const baseLanguage = getBaseLanguageCode(languageToUse);
  
  // Only send language if it's not English (English uses default README.md)
  // The language parameter is optional and backward compatible:
  // - If backend doesn't support it, it will be ignored and default README.md is returned
  // - If backend supports it, it will return the language-specific README
  const message: any = {
    type: "hacs/repository/info",
    repository_id: repositoryId,
  };
  
  // Determine if we should send the language parameter
  if (baseLanguage && baseLanguage !== "en") {
    if (backendSupportsLanguage === true) {
      // Backend supports it: send the parameter
      message.language = baseLanguage;
      console.log(`[HACS] Sending language parameter: "${baseLanguage}" (backend supports it)`);
    } else if (backendSupportsLanguage === false) {
      // Backend doesn't support it: don't send the parameter
      console.log(`[HACS] Skipping language parameter (backend doesn't support it)`);
    } else {
      // Cache is null: need to determine backend support
      // Wait for any ongoing check to complete first to prevent race conditions
      if (backendSupportCheckPromise) {
        console.log(`[HACS] Waiting for ongoing backend support check...`);
        await backendSupportCheckPromise;
        
        // After waiting, check cache again (another request might have set it)
        if (backendSupportsLanguage === true) {
          message.language = baseLanguage;
          console.log(`[HACS] Sending language parameter: "${baseLanguage}" (backend supports it - from concurrent request)`);
        } else if (backendSupportsLanguage === false) {
          console.log(`[HACS] Skipping language parameter (backend doesn't support it - from concurrent request)`);
        }
        // If still null after waiting, another request is handling it - proceed without language
      } else {
        // No ongoing check: create a promise to track this check and prevent race conditions
        let resolveCheck: () => void;
        backendSupportCheckPromise = new Promise((resolve) => {
          resolveCheck = resolve;
        });
        
        message.language = baseLanguage;
        console.log(`[HACS] Sending language parameter: "${baseLanguage}" (first attempt)`);
        
        try {
          const result = await hass.connection.sendMessagePromise<RepositoryInfo | undefined>(message);
          
          // Success: backend supports the language parameter
          // Only set to true if still null (protect against concurrent modifications)
          if (backendSupportsLanguage === null) {
            backendSupportsLanguage = true;
            console.log(`[HACS] Backend accepted language parameter "${message.language}" - caching support`);
          }
          
          // Resolve the check promise
          resolveCheck!();
          backendSupportCheckPromise = null;
          
          return result;
        } catch (error: any) {
          // Check if error is about extra keys (backend doesn't support language parameter)
          const errorMessage = error?.message || String(error);
          console.log(`[HACS] Error received:`, errorMessage);
          
          if (
            errorMessage.includes("extra keys not allowed") &&
            (errorMessage.includes("language") || errorMessage.includes("'language'"))
          ) {
            // Backend doesn't support language parameter
            // Only set to false if still null (protect against concurrent successful requests)
            if (backendSupportsLanguage === null) {
              backendSupportsLanguage = false;
              console.log(`[HACS] Backend rejected language parameter - caching rejection and retrying without it`);
            }
            
            // Resolve the check promise
            resolveCheck!();
            backendSupportCheckPromise = null;
            
            // Retry without language parameter
            const messageWithoutLanguage: any = {
              type: "hacs/repository/info",
              repository_id: repositoryId,
            };
            
            return hass.connection.sendMessagePromise<RepositoryInfo | undefined>(messageWithoutLanguage);
          }
          
          // Resolve the check promise (even on error, so other requests can proceed)
          resolveCheck!();
          backendSupportCheckPromise = null;
          
          // Re-throw other errors
          console.log(`[HACS] Error is not related to language parameter, re-throwing`);
          throw error;
        }
      }
    }
  }
  
  // Make the request (either with or without language parameter)
  try {
    const result = await hass.connection.sendMessagePromise<RepositoryInfo | undefined>(message);
    return result;
  } catch (error: any) {
    // Re-throw errors
    throw error;
  }
};

export const repositoryDownloadVersion = async (
  hass: HomeAssistant,
  repository: string,
  version?: string,
) =>
  hass.connection.sendMessagePromise<void>({
    type: "hacs/repository/download",
    repository: repository,
    version,
  });

export const repositoryReleases = async (hass: HomeAssistant, repositoryId: string) =>
  hass.connection.sendMessagePromise<
    { tag: string; name: string; published_at: string; prerelease: boolean }[]
  >({
    type: "hacs/repository/releases",
    repository_id: repositoryId,
  });
