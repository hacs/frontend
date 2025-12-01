# Add Multilingual README Support

## Summary

This PR adds support for automatic language detection and display of multilingual README files in HACS. The frontend now automatically requests language-specific README files (e.g., `README.de.md`, `README.fr.md`) based on the user's Home Assistant language setting, with automatic fallback to `README.md` if a language-specific version is not available.

## Related Backend PR

This frontend implementation requires the corresponding backend changes. Please see:
- **Backend PR:** https://github.com/hacs/integration/pull/4964 

The backend must support the optional `language` parameter in the `hacs/repository/info` WebSocket command to fully enable this feature.

## Changes

### Core Implementation

1. **Language Code Extraction** (`src/data/repository.ts`)
   - Added `getBaseLanguageCode()` function to extract base language code from BCP47 format (e.g., "de-DE" → "de")
   - Handles edge cases (undefined, empty strings, uppercase)

2. **Repository Information Fetching** (`src/data/repository.ts`)
   - Enhanced `fetchRepositoryInformation()` to accept optional `language` parameter
   - Automatically extracts language from `hass.language` if not provided
   - Sends `language` parameter in WebSocket message when language is not English
   - Implements intelligent backend support detection with caching:
     - First request: Attempts to send `language` parameter
     - On success: Caches backend support and continues sending parameter
     - On error (unsupported parameter): Caches rejection and retries without parameter
   - **Race condition protection**: Uses promise-based synchronization to prevent concurrent requests from corrupting the cache state
   - Fully backward compatible: Works with both old and new backend versions

3. **Repository Dashboard** (`src/dashboards/hacs-repository-dashboard.ts`)
   - Updated `_fetchRepository()` to pass `hass.language` to `fetchRepositoryInformation()`
   - Added language change detection in `updated()` lifecycle hook
   - Automatically reloads repository information when user changes Home Assistant language
   - **Fixed false positive detection**: Only refetches when language actually changed (prevents unnecessary API calls on initial property changes)

4. **Download Dialog** (`src/components/dialogs/hacs-download-dialog.ts`)
   - Updated `_fetchRepository()` to pass `hass.language` for consistency

## Features

- ✅ **Automatic Language Detection**: Uses `hass.language` from Home Assistant settings
- ✅ **BCP47 Support**: Extracts base language code from full BCP47 format (e.g., "de-DE" → "de")
- ✅ **Intelligent Fallback**: Falls back to `README.md` if language-specific README doesn't exist
- ✅ **Backend Compatibility**: Automatically detects backend support and adapts behavior
- ✅ **Backward Compatible**: Works with old backend versions (graceful degradation)
- ✅ **Language Change Detection**: Automatically reloads README when user changes language
- ✅ **No Breaking Changes**: Existing repositories continue to work without modifications

## File Naming Convention

Repository maintainers can provide multilingual README files using the following naming pattern:

- `README.md` - Default/English (always used as fallback)
- `README.de.md` - German
- `README.fr.md` - French
- `README.es.md` - Spanish
- `README.it.md` - Italian
- `README.nl.md` - Dutch
- `README.pl.md` - Polish
- `README.pt.md` - Portuguese
- `README.ru.md` - Russian
- `README.zh.md` - Chinese
- etc.

**Format:** `README.{language_code}.md` (ISO 639-1 language code, 2 letters, lowercase)

## Behavior

### When Backend Supports Language Parameter

1. User with `hass.language = "de"` opens a repository
2. Frontend extracts base language code: "de"
3. Frontend sends WebSocket message: `{ type: "hacs/repository/info", repository_id: "...", language: "de" }`
4. Backend returns `README.de.md` if available, otherwise `README.md`
5. Frontend displays the appropriate README

### When Backend Doesn't Support Language Parameter

1. User with `hass.language = "de"` opens a repository
2. Frontend attempts to send `language` parameter
3. Backend rejects the parameter (error: "extra keys not allowed")
4. Frontend detects the error, caches the rejection, and retries without `language` parameter
5. Backend returns `README.md` (standard behavior)
6. Frontend displays `README.md`

This ensures **zero breaking changes** and graceful degradation.

## Testing

### Manual Testing

1. **Test with Backend Support:**
   - Ensure backend PR is merged or backend supports `language` parameter
   - Set Home Assistant language to German (`de`)
   - Open a repository with `README.de.md`
   - Verify that `README.de.md` is displayed

2. **Test Fallback:**
   - Set Home Assistant language to German (`de`)
   - Open a repository with only `README.md` (no `README.de.md`)
   - Verify that `README.md` is displayed

3. **Test Backward Compatibility:**
   - Use an old backend version (without `language` parameter support)
   - Set Home Assistant language to German (`de`)
   - Open any repository
   - Verify that no errors occur and `README.md` is displayed

4. **Test Language Change:**
   - Open a repository
   - Change Home Assistant language in settings
   - Verify that repository information is automatically reloaded

### Browser Console Logs

The implementation includes debug logging to help verify behavior:

- `[HACS] Sending language parameter: "de" (first attempt)` - First request with language
- `[HACS] Backend accepted language parameter "de" - caching support` - Backend supports it
- `[HACS] Backend rejected language parameter - caching rejection and retrying without it` - Backend doesn't support it
- `[HACS] Skipping language parameter (backend doesn't support it)` - Using cached rejection

## Implementation Details

### Language Code Extraction

```typescript
export const getBaseLanguageCode = (language: string | undefined): string => {
  if (!language) {
    return "en";
  }
  return language.split("-")[0].toLowerCase();
};
```

**Examples:**
- `"de-DE"` → `"de"`
- `"en-US"` → `"en"`
- `"fr"` → `"fr"`
- `undefined` → `"en"`

### Backend Support Detection

The implementation uses a session-based cache to avoid repeated failed requests:

```typescript
let backendSupportsLanguage: boolean | null = null;
let backendSupportCheckPromise: Promise<void> | null = null;
```

- `null`: Not yet determined (will attempt to send parameter)
- `true`: Backend supports it (will send parameter)
- `false`: Backend doesn't support it (will skip parameter)

**Race Condition Protection:**
- Uses `backendSupportCheckPromise` to synchronize concurrent requests
- Only sets cache if still `null` to prevent corruption from race conditions
- Concurrent requests wait for the first check to complete before proceeding

This cache is reset on page reload and can be manually reset using `resetBackendLanguageSupportCache()` for testing.

## Alignment with Home Assistant Standards

This implementation follows Home Assistant's translation system patterns:

- ✅ Uses `hass.language` (same as `async_get_translations()`)
- ✅ Extracts base language code from BCP47 format
- ✅ Automatic fallback to English/default
- ✅ Consistent with Home Assistant's i18n approach

## Documentation

- **Backend Implementation Guide:** `BACKEND_IMPLEMENTATION_GUIDE.md` - Complete guide for backend developers
- **Feature Request:** `HACS_MULTILINGUAL_FEATURE_REQUEST.md` - Original feature specification
- **Testing Guide:** `TESTING_MULTILINGUAL_README.md` - Testing instructions

## Checklist

- [x] Code follows project style guidelines
- [x] Changes are backward compatible
- [x] Error handling implemented
- [x] Debug logging added
- [x] Language change detection implemented
- [x] Documentation updated
- [x] Tested with backend support
- [x] Tested without backend support (backward compatibility)

## Screenshots

_Add screenshots showing multilingual README display if available_

## Bug Fixes

This PR includes fixes for three critical bugs discovered during implementation:

1. **Race Condition in Backend Support Cache** (`src/data/repository.ts`)
   - **Issue**: Concurrent requests with different languages could corrupt the cache state
   - **Fix**: Implemented promise-based synchronization to ensure only one request determines backend support at a time
   - **Protection**: Cache is only set if still `null`, preventing concurrent modifications

2. **False Language Change Detection** (`src/dashboards/hacs-repository-dashboard.ts`)
   - **Issue**: Repository was refetched unnecessarily when `oldHass` was `undefined` (first property change)
   - **Fix**: Added check to ensure `oldHass` exists before comparing languages
   - **Result**: Eliminates unnecessary API calls on initial component updates

3. **Language Parameter Not Removed After Backend Rejection** (`src/data/repository.ts`)
   - **Issue**: When waiting for a concurrent backend support check, if the backend rejects the language parameter, the code logged "Skipping language parameter" but didn't actually remove it from the message object. The message still contained the language property, which then got sent anyway, causing repeated backend errors.
   - **Fix**: Added `delete message.language;` when `backendSupportsLanguage === false` after waiting for concurrent check
   - **Result**: Prevents language parameter from being sent when backend doesn't support it, eliminating repeated errors

## Notes

- This PR only implements the frontend changes. The backend must be updated separately to fully enable the feature.
- The implementation is designed to work gracefully even if the backend doesn't support the `language` parameter yet.
- Repository maintainers are not required to provide multilingual READMEs - this is an opt-in feature.

