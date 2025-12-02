# Add Multilingual README Support

## Summary

This PR adds support for automatic language detection and display of multilingual README files in HACS. The frontend now automatically requests language-specific README files (e.g., `README.de.md`, `README.fr.md`) based on the user's Home Assistant language setting. The backend handles file selection and automatically falls back to `README.md` if a language-specific version is not available.

## Related Backend PR

This frontend implementation requires the corresponding backend changes:
- **Backend PR:** https://github.com/hacs/integration/pull/4965

## Changes

### Core Implementation

1. **Language Code Extraction** (`src/data/repository.ts`)
   - Added `getBaseLanguageCode()` function to extract base language code from BCP47 format (e.g., "de-DE" → "de")
   - Handles edge cases (undefined, empty strings, uppercase)

2. **Repository Information Fetching** (`src/data/repository.ts`)
   - Enhanced `fetchRepositoryInformation()` to accept optional `language` parameter
   - Uses `hass.language` if not provided
   - Sends `language` parameter in WebSocket message only when language is not English

3. **Repository Dashboard** (`src/dashboards/hacs-repository-dashboard.ts`)
   - Updated `_fetchRepository()` to pass `hass.language` to `fetchRepositoryInformation()`
   - Added language change detection in `updated()` lifecycle hook
   - Automatically reloads repository information when user changes Home Assistant language

4. **Download Dialog** (`src/components/dialogs/hacs-download-dialog.ts`)
   - Updated `_fetchRepository()` to pass `hass.language` for consistency

## File Naming Convention

Repository maintainers can provide multilingual README files using the pattern `README.{language_code}.md` (e.g., `README.de.md`, `README.fr.md`). The default `README.md` is always used as fallback.

## Checklist

- [x] Code follows project style guidelines
- [x] Changes are backward compatible
- [x] Code tested locally
- [x] TypeScript types are correct
- [x] Works with backend PR #4965

## Notes

- This PR only implements the frontend changes. The backend must be updated separately (PR #4965).
- Repository maintainers are not required to provide multilingual READMEs - this is an opt-in feature.

