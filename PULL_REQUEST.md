# Add Multilingual README Support

## Summary

This PR adds support for multilingual README files in HACS. The frontend passes the user's Home Assistant language setting (`hass.language`) to the backend via the `hacs/repository/info` WebSocket command. The backend handles all language processing, file selection, and fallback logic.

## Related Backend PR

This frontend implementation requires the corresponding backend changes:
- **Backend PR:** https://github.com/hacs/integration/pull/4965

## Changes

1. **Repository Information Fetching** (`src/data/repository.ts`)
   - Added `language` parameter to `fetchRepositoryInformation()` function
   - Always includes `language` field in WebSocket message (uses `hass.language` as fallback)

2. **Repository Dashboard** (`src/dashboards/hacs-repository-dashboard.ts`)
   - Passes `hass.language` when fetching repository information
   - Detects language changes in `updated()` lifecycle hook and automatically refetches repository data

3. **Download Dialog** (`src/components/dialogs/hacs-download-dialog.ts`)
   - Passes `hass.language` when fetching repository information

## Checklist

- [x] Code follows project style guidelines
- [x] Changes are backward compatible
- [x] Code tested locally
- [x] TypeScript types are correct
- [x] Works with backend PR #4965

## Notes

- This PR only implements the frontend changes. The backend must be updated separately (PR #4965).
- Repository maintainers can provide multilingual README files using the pattern `README.{language_code}.md` (e.g., `README.de.md`, `README.fr.md`). The default `README.md` is always used as fallback.

