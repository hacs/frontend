# Add Multilingual README Support

## Summary

This PR adds support for automatic language detection and display of multilingual README files in HACS. The frontend now automatically requests language-specific README files (e.g., `README.de.md`, `README.fr.md`) based on the user's Home Assistant language setting, with automatic fallback to `README.md` if a language-specific version is not available.

## Related Backend PR

This frontend implementation requires the corresponding backend changes. Please see:
- **Backend PR:** https://github.com/hacs/integration/pull/4965 

The backend must support the optional `language` parameter in the `hacs/repository/info` WebSocket command to fully enable this feature.

## Changes

### Core Implementation

1. **Language Code Extraction** (`src/data/repository.ts`)
   - Added `getBaseLanguageCode()` function to extract base language code from BCP47 format (e.g., "de-DE" → "de")
   - Handles edge cases (undefined, empty strings, uppercase)

2. **Repository Information Fetching** (`src/data/repository.ts`)
   - Enhanced `fetchRepositoryInformation()` to accept optional `language` parameter
   - Automatically extracts language from `hass.language` if not provided
   - Extracts base language code from BCP47 format (e.g., "de-DE" → "de")
   - Sends `language` parameter in WebSocket message only when language is not English
   - Simple, direct implementation without caching or retry logic

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

1. User with `hass.language = "de-DE"` opens a repository
2. Frontend extracts base language code: "de"
3. Frontend sends WebSocket message: `{ type: "hacs/repository/info", repository_id: "...", language: "de" }`
4. Backend returns `README.de.md` if available, otherwise `README.md`
5. Frontend displays the appropriate README

**Note:** This implementation requires backend support for the `language` parameter. If the backend doesn't support it, the parameter will be ignored by the backend, and `README.md` will be returned (standard behavior).

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

3. **Test Language Change:**
   - Open a repository
   - Change Home Assistant language in settings
   - Verify that repository information is automatically reloaded

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

### Repository Information Fetching

```typescript
export const fetchRepositoryInformation = async (
  hass: HomeAssistant,
  repositoryId: string,
  language?: string,
): Promise<RepositoryInfo | undefined> => {
  const message: any = {
    type: "hacs/repository/info",
    repository_id: repositoryId,
  };

  const languageToUse = language ?? hass.language;
  if (languageToUse) {
    const baseLanguage = getBaseLanguageCode(languageToUse);
    if (baseLanguage !== "en") {
      message.language = baseLanguage;
    }
  }

  return hass.connection.sendMessagePromise<RepositoryInfo | undefined>(message);
};
```

The implementation is straightforward: it extracts the base language code and includes it in the WebSocket message if the language is not English. The backend handles the actual file selection and fallback logic.

## Alignment with Home Assistant Standards

This implementation follows Home Assistant's translation system patterns:

- ✅ Uses `hass.language` (same as `async_get_translations()`)
- ✅ Extracts base language code from BCP47 format
- ✅ Automatic fallback to English/default
- ✅ Consistent with Home Assistant's i18n approach

## Checklist

- [x] Code follows project style guidelines
- [x] Changes are backward compatible
- [x] Language change detection implemented
- [x] Code tested locally
- [x] No commented out code
- [x] TypeScript types are correct
- [x] No console errors or warnings
- [x] Works with backend PR #4965

## Screenshots

_Add screenshots showing multilingual README display if available_

## Bug Fixes

This PR includes a fix for language change detection:

1. **False Language Change Detection** (`src/dashboards/hacs-repository-dashboard.ts`)
   - **Issue**: Repository was refetched unnecessarily when `oldHass` was `undefined` (first property change)
   - **Fix**: Added check to ensure `oldHass` exists before comparing languages
   - **Result**: Eliminates unnecessary API calls on initial component updates

## Type of Change

- [x] New feature (non-breaking change which adds functionality)
- [ ] Bugfix (non-breaking change which fixes an issue)
- [ ] Breaking change (fix/feature causing existing functionality to break)
- [ ] Code quality improvements to existing code or addition of tests

## Testing Performed

- [x] Tested with backend support (requires backend PR #4965)
- [x] Tested fallback behavior (repository without language-specific README)
- [x] Tested language change detection
- [x] Tested with various BCP47 language codes (de-DE, en-US, fr, etc.)
- [x] Verified backward compatibility (works without backend support)

## Notes

- This PR only implements the frontend changes. The backend must be updated separately to fully enable the feature.
- The implementation requires backend support for the `language` parameter. If the backend doesn't support it, the parameter will be ignored and `README.md` will be returned.
- Repository maintainers are not required to provide multilingual READMEs - this is an opt-in feature.
- This PR is related to backend PR #4965: https://github.com/hacs/integration/pull/4965

