# Feature Request: Multilingual README Support in HACS

## Summary

Add support for automatic language detection and display of README files in HACS, using the same mechanism as Home Assistant's translation system. This would allow repository maintainers to provide README files in multiple languages (e.g., `README.md`, `README.de.md`, `README.fr.md`) and have HACS automatically display the appropriate language based on the user's Home Assistant language setting (`hass.config.language`).

## Motivation

Currently, HACS always displays `README.md` regardless of the user's language preference. This creates a barrier for non-English speaking users who may not understand the installation and configuration instructions.

Home Assistant (both Core and Custom integrations) uses a standardized translation system:
- **File structure**: `translations/<language_code>.json` (e.g., `translations/de.json`, `translations/en.json`)
- **Language detection**: Uses `hass.config.language` from user settings
- **Automatic loading**: Home Assistant automatically loads the correct translation file based on user language
- **Fallback**: Always falls back to `en.json` if language-specific file doesn't exist

This mechanism should be applied to README files in HACS, ensuring consistency with how Home Assistant handles translations.

## Proposed Solution

### File Naming Convention

Follow Home Assistant's translation file naming convention, adapted for README files:

**Home Assistant Pattern:**
- `translations/<language_code>.json` (e.g., `translations/de.json`, `translations/en.json`)
- Language codes: BCP47 format, 2-letter lowercase (e.g., `de`, `en`, `fr`, `es`)

**HACS README Pattern:**
- `README.md` - Default/English (fallback)
- `README.de.md` - German
- `README.fr.md` - French
- `README.es.md` - Spanish
- `README.it.md` - Italian
- etc.

Language codes follow BCP47 format (2-letter lowercase codes). Format: `README.<language_code>.md`

### Language Detection Policy

Follow Home Assistant's language detection mechanism:

1. **Language source**: Use `hass.config.language` from user's Home Assistant settings
   - No browser language detection - only Home Assistant's configured language

2. **Language code extraction**:
   - Extract base language code from BCP47 format: `language.split("-")[0].lower()` (e.g., `de-DE` → `de`, `en-US` → `en`)

3. **Fallback**:
   - If language-specific file doesn't exist → fallback to `README.md`
   - If language is `en` or not set → use `README.md` directly

### Implementation Details

1. **Language Source**: Get language from `hass.config.language` (same as Home Assistant's `async_get_translations()`)
   - Extract base language code: `language.split("-")[0].lower()`

2. **File Detection**: Check for `README.<language_code>.md` in repository root
   - Pattern: `README.<language_code>.md` (e.g., `README.de.md` for German)
   - Use lowercase 2-letter language codes (BCP47 format)

3. **File Resolution Logic**:
   - If `hass.config.language = "de"` → try `README.de.md`, fallback to `README.md`
   - If `hass.config.language = "en"` → use `README.md` directly
   - If language-specific file doesn't exist → fallback to `README.md`

4. **Backward Compatibility**: Repositories with only `README.md` continue to work without changes

5. **No Caching**: Language is read directly from `hass.config.language` each time

### Example Implementation Flow

```python
def get_readme_path(hass: HomeAssistant, repository) -> str:
    """Get the appropriate README file path based on Home Assistant language setting."""
    language = hass.config.language
    base_language = language.split("-")[0].lower() if language else "en"
    
    if base_language == "en" or not base_language:
        return "README.md"
    
    language_readme = f"README.{base_language}.md"
    if file_exists(repository, language_readme):
        return language_readme
    
    return "README.md"
```

## Benefits

1. **Better User Experience**: Users see documentation in their preferred language
2. **Consistency**: Aligns with Home Assistant's existing i18n approach
3. **Community Friendly**: Encourages contributions from non-English speakers
4. **Backward Compatible**: Existing repositories continue to work without changes
5. **Optional**: Repository maintainers can choose to provide translations or not

## Use Cases

1. German user (`hass.config.language = "de"`) sees `README.de.md` if available, otherwise `README.md`
2. French user (`hass.config.language = "fr"`) sees `README.fr.md` if available, otherwise `README.md`
3. English user (`hass.config.language = "en"` or unset) sees `README.md`
4. Unsupported language falls back to `README.md`
5. Repository with only `README.md` works as before (backward compatible)

## Alternatives Considered

1. **Single multilingual README**: Less maintainable, harder to read
2. **Manual language selection**: Adds friction, not automatic
3. **GitHub Pages integration**: Requires additional setup, not native to HACS

## Implementation Notes

- This feature should be opt-in for repository maintainers (they provide translated READMEs)
- The feature should gracefully handle missing translations (fallback to English)
- Consider adding a language indicator/switcher in the UI for manual override
- May want to add validation in HACS validation action to check README file naming

## Related Issues/PRs

- Uses the same mechanism as Home Assistant's translation system (`translations/<language_code>.json`)
- Follows the same pattern as `async_get_translations()` function
- Uses `hass.config.language` as language source
- Uses BCP47 language code format
- Could be extended to support other documentation files in the future

## References

- Home Assistant i18n documentation: https://developers.home-assistant.io/docs/translations/
- BCP47 language tags: https://en.wikipedia.org/wiki/IETF_language_tag
- Home Assistant Frontend translations: https://github.com/home-assistant/frontend/tree/dev/src/translations
- Custom component translations: Custom components use `translations/` directory (e.g., `translations/de.json`, `translations/en.json`)

---

**Note**: Implementation Repository and Submission:

**Target Repository:**
- **HACS Frontend**: https://github.com/hacs/frontend
  - This is where README files are rendered and displayed in the HACS UI
  - The multilingual README feature should be implemented here

**How to Submit:**

**Option 1: GitHub Discussions (Recommended)**
1. Go to https://github.com/hacs/frontend/discussions (or https://github.com/hacs/integration/discussions)
2. Click "New discussion"
3. Choose "Ideas" or "Q&A" category
4. Use the title: "Feature Request: Multilingual README Support"
5. Copy the content from this document into the discussion

**Option 2: Direct Pull Request**
1. Fork the HACS Frontend repository: https://github.com/hacs/frontend
2. Create a branch for the feature (e.g., `feature/multilingual-readme`)
3. Implement the changes in the frontend code that handles README rendering
4. Create a Pull Request with reference to this feature request

**Option 3: Issue in Frontend Repository**
1. Go to https://github.com/hacs/frontend/issues
2. Create a new issue describing the feature request
3. Link to this detailed specification

Before implementing, it's recommended to discuss the feature with the HACS maintainers to ensure alignment with project goals and to understand the codebase structure.

