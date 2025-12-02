# Add Multilingual README and Description Support

## Summary

This PR adds support for multilingual README files and repository descriptions in HACS. The frontend passes the user's Home Assistant language setting (`hass.language`) to the backend via the `hacs/repository/info` and `hacs/repositories/list` WebSocket commands. The backend handles all language processing, file selection, and fallback logic.

## Related Backend PR

This frontend implementation requires the corresponding backend changes:
- **Backend PR:** https://github.com/hacs/integration/pull/4965

## Changes

1. **Repository Information Fetching** (`src/data/repository.ts`)
   - Added `language` parameter to `fetchRepositoryInformation()` function
   - Always includes `language` field in WebSocket message (uses `hass.language` as fallback)

2. **Repository List** (`src/data/websocket.ts`)
   - Added `language` parameter to `getRepositories()` function
   - Passes language to backend for multilingual description support

3. **Repository Dashboard** (`src/dashboards/hacs-repository-dashboard.ts`)
   - Passes `hass.language` when fetching repository information
   - Detects language changes in `updated()` lifecycle hook and automatically refetches repository data

4. **Download Dialog** (`src/components/dialogs/hacs-download-dialog.ts`)
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
- Repository descriptions can also be multilingual using `DESCRIPTION.{language_code}.txt` files (e.g., `DESCRIPTION.de.txt`, `DESCRIPTION.fr.txt`). Falls back to GitHub repository description if not found.

