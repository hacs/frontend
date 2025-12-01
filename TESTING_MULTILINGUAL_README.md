# Testanleitung: Mehrsprachige README-Unterstützung

Diese Anleitung beschreibt, wie Sie die mehrsprachige README-Unterstützung in HACS testen können.

## Voraussetzungen

1. **HACS Frontend Repository** mit den Änderungen aus dem Branch `feature/Multilingual-readme`
2. **HACS Backend Integration** (muss den `language`-Parameter in `hacs/repository/info` unterstützen)
3. **Home Assistant Instanz** mit HACS installiert
4. **Test-Repository** mit mehrsprachigen README-Dateien (z.B. `README.md`, `README.de.md`, `README.fr.md`)

## 1. Unit-Tests für Sprachcode-Extraktion

### Test der `getBaseLanguageCode` Funktion

Erstellen Sie eine Testdatei oder testen Sie direkt in der Browser-Konsole:

```typescript
import { getBaseLanguageCode } from './src/data/repository';

// Test 1: BCP47 Format mit Region
console.assert(getBaseLanguageCode("de-DE") === "de", "de-DE sollte 'de' ergeben");
console.assert(getBaseLanguageCode("en-US") === "en", "en-US sollte 'en' ergeben");
console.assert(getBaseLanguageCode("fr-FR") === "fr", "fr-FR sollte 'fr' ergeben");

// Test 2: Einfache Sprachcodes
console.assert(getBaseLanguageCode("de") === "de", "de sollte 'de' ergeben");
console.assert(getBaseLanguageCode("en") === "en", "en sollte 'en' ergeben");
console.assert(getBaseLanguageCode("fr") === "fr", "fr sollte 'fr' ergeben");

// Test 3: Undefined/Null
console.assert(getBaseLanguageCode(undefined) === "en", "undefined sollte 'en' ergeben");
console.assert(getBaseLanguageCode("") === "en", "leerer String sollte 'en' ergeben");

// Test 4: Großbuchstaben
console.assert(getBaseLanguageCode("DE-DE") === "de", "DE-DE sollte 'de' ergeben");
console.assert(getBaseLanguageCode("EN-US") === "en", "EN-US sollte 'en' ergeben");

console.log("Alle Tests bestanden!");
```

## 2. Manuelle Tests im Browser

### Schritt 1: Frontend starten

```bash
# Im HACS Frontend Repository
yarn start
# oder
make start
```

### Schritt 2: Home Assistant öffnen

1. Öffnen Sie Home Assistant in Ihrem Browser
2. Navigieren Sie zu HACS
3. Öffnen Sie die Browser-Entwicklertools (F12)

### Schritt 3: Websocket-Nachrichten überwachen

In der Browser-Konsole können Sie die Websocket-Nachrichten überwachen:

```javascript
// Websocket-Nachrichten loggen
const originalSendMessage = window.hassConnection?.sendMessage;
if (originalSendMessage) {
  window.hassConnection.sendMessage = function(message) {
    if (message.type === "hacs/repository/info") {
      console.log("HACS Repository Info Request:", message);
      if (message.language) {
        console.log("✓ Sprachparameter gesendet:", message.language);
      } else {
        console.log("ℹ Kein Sprachparameter (vermutlich Englisch)");
      }
    }
    return originalSendMessage.call(this, message);
  };
}
```

### Schritt 4: Sprache in Home Assistant ändern

1. Gehen Sie zu **Einstellungen** → **Sprache & Region**
2. Ändern Sie die Sprache (z.B. von Englisch zu Deutsch)
3. Navigieren Sie zurück zu HACS
4. Öffnen Sie ein Repository mit mehrsprachigen README-Dateien

### Schritt 5: Repository-Informationen prüfen

1. Öffnen Sie ein Repository in HACS
2. Prüfen Sie in der Browser-Konsole, ob die richtige Websocket-Nachricht gesendet wurde
3. Prüfen Sie, ob die README in der richtigen Sprache angezeigt wird

## 3. Test mit verschiedenen Sprachen

### Test-Szenarien

| Home Assistant Sprache | Erwartete README-Datei | Websocket-Nachricht |
|------------------------|------------------------|---------------------|
| `en` oder `en-US` | `README.md` | Kein `language`-Parameter |
| `de` oder `de-DE` | `README.de.md` (falls vorhanden), sonst `README.md` | `language: "de"` |
| `fr` oder `fr-FR` | `README.fr.md` (falls vorhanden), sonst `README.md` | `language: "fr"` |
| `es` oder `es-ES` | `README.es.md` (falls vorhanden), sonst `README.md` | `language: "es"` |
| `it` oder `it-IT` | `README.it.md` (falls vorhanden), sonst `README.md` | `language: "it"` |

### Test-Repository erstellen

Erstellen Sie ein Test-Repository mit folgenden Dateien:

```
test-repository/
├── README.md          (Englisch - Standard)
├── README.de.md       (Deutsch)
├── README.fr.md       (Französisch)
└── README.es.md       (Spanisch)
```

Jede Datei sollte eindeutigen Inhalt haben, z.B.:

**README.md:**
```markdown
# Test Repository

This is the English README.
```

**README.de.md:**
```markdown
# Test Repository

Dies ist die deutsche README.
```

**README.fr.md:**
```markdown
# Test Repository

Ceci est le README français.
```

## 4. Automatisierte Tests

### Test-Datei erstellen

Erstellen Sie `src/data/__tests__/repository.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getBaseLanguageCode, fetchRepositoryInformation } from '../repository';
import type { HomeAssistant } from '../../../homeassistant-frontend/src/types';

describe('getBaseLanguageCode', () => {
  it('should extract base language from BCP47 format', () => {
    expect(getBaseLanguageCode('de-DE')).toBe('de');
    expect(getBaseLanguageCode('en-US')).toBe('en');
    expect(getBaseLanguageCode('fr-FR')).toBe('fr');
  });

  it('should handle simple language codes', () => {
    expect(getBaseLanguageCode('de')).toBe('de');
    expect(getBaseLanguageCode('en')).toBe('en');
    expect(getBaseLanguageCode('fr')).toBe('fr');
  });

  it('should return "en" for undefined or empty', () => {
    expect(getBaseLanguageCode(undefined)).toBe('en');
    expect(getBaseLanguageCode('')).toBe('en');
  });

  it('should convert to lowercase', () => {
    expect(getBaseLanguageCode('DE-DE')).toBe('de');
    expect(getBaseLanguageCode('EN-US')).toBe('en');
  });
});

describe('fetchRepositoryInformation', () => {
  it('should include language parameter for non-English languages', async () => {
    const mockHass = {
      language: 'de-DE',
      connection: {
        sendMessagePromise: async (message: any) => {
          expect(message.language).toBe('de');
          return { additional_info: 'Test' };
        }
      }
    } as unknown as HomeAssistant;

    await fetchRepositoryInformation(mockHass, 'test-repo');
  });

  it('should not include language parameter for English', async () => {
    const mockHass = {
      language: 'en',
      connection: {
        sendMessagePromise: async (message: any) => {
          expect(message.language).toBeUndefined();
          return { additional_info: 'Test' };
        }
      }
    } as unknown as HomeAssistant;

    await fetchRepositoryInformation(mockHass, 'test-repo');
  });
});
```

### Tests ausführen

```bash
# Wenn Vitest konfiguriert ist
yarn test

# Oder direkt mit Node
node --experimental-vm-modules node_modules/vitest/dist/cli.js run
```

## 5. Integrationstests

### Test mit echten Home Assistant Instanz

1. **HACS Backend aktualisieren**: Stellen Sie sicher, dass das Backend den `language`-Parameter unterstützt
2. **Frontend bauen und installieren**:
   ```bash
   yarn build
   # Kopieren Sie die gebauten Dateien in Ihr HACS Frontend Verzeichnis
   ```
3. **Home Assistant neu starten**
4. **Sprache ändern und Repository öffnen**

### Browser-Entwicklertools verwenden

1. Öffnen Sie die **Netzwerk**-Registerkarte
2. Filtern Sie nach **WS** (WebSocket)
3. Öffnen Sie ein Repository in HACS
4. Prüfen Sie die gesendeten Nachrichten

## 6. Edge Cases testen

### Test-Szenarien für Edge Cases

1. **Sprache ändern während Repository geöffnet ist**
   - Öffnen Sie ein Repository
   - Ändern Sie die Sprache in Home Assistant
   - Prüfen Sie, ob die README automatisch neu geladen wird

2. **Repository ohne sprachspezifische README**
   - Verwenden Sie ein Repository mit nur `README.md`
   - Ändern Sie die Sprache auf Deutsch
   - Prüfen Sie, ob die englische README angezeigt wird (Fallback)

3. **Ungültige Sprachcodes**
   - Testen Sie mit `hass.language = undefined`
   - Testen Sie mit `hass.language = ""`
   - Prüfen Sie, ob der Fallback auf Englisch funktioniert

4. **Backend ohne Sprachunterstützung**
   - Testen Sie mit einem älteren Backend, das den `language`-Parameter nicht unterstützt
   - Prüfen Sie, ob die Standard-README angezeigt wird

## 7. Debugging

### Console-Logging aktivieren

Fügen Sie temporär Logging hinzu:

```typescript
// In src/data/repository.ts
export const fetchRepositoryInformation = async (
  hass: HomeAssistant,
  repositoryId: string,
  language?: string,
): Promise<RepositoryInfo | undefined> => {
  const baseLanguage = language ? getBaseLanguageCode(language) : getBaseLanguageCode(hass.language);
  
  console.log('[HACS] Language detection:', {
    hassLanguage: hass.language,
    providedLanguage: language,
    baseLanguage,
  });
  
  const message: any = {
    type: "hacs/repository/info",
    repository_id: repositoryId,
  };
  
  if (baseLanguage && baseLanguage !== "en") {
    message.language = baseLanguage;
    console.log('[HACS] Sending language parameter:', baseLanguage);
  } else {
    console.log('[HACS] Using default README.md (English)');
  }
  
  return hass.connection.sendMessagePromise(message);
};
```

## 8. Checkliste für vollständige Tests

- [ ] Unit-Tests für `getBaseLanguageCode` bestehen
- [ ] Websocket-Nachricht enthält `language`-Parameter für nicht-englische Sprachen
- [ ] Websocket-Nachricht enthält keinen `language`-Parameter für Englisch
- [ ] README wird in der richtigen Sprache angezeigt
- [ ] Fallback auf `README.md` funktioniert, wenn sprachspezifische Datei fehlt
- [ ] Repository-Informationen werden neu geladen, wenn sich die Sprache ändert
- [ ] Funktioniert mit verschiedenen BCP47-Formaten (z.B. `de-DE`, `en-US`)
- [ ] Funktioniert mit einfachen Sprachcodes (z.B. `de`, `en`)
- [ ] Funktioniert mit `undefined` oder leerem String (Fallback auf Englisch)
- [ ] Backward-kompatibel mit Backend ohne Sprachunterstützung

## 9. Bekannte Probleme und Lösungen

### Problem: README wird nicht in der richtigen Sprache angezeigt

**Lösung:**
1. Prüfen Sie, ob das Backend den `language`-Parameter unterstützt
2. Prüfen Sie die Browser-Konsole auf Fehler
3. Prüfen Sie, ob die sprachspezifische README-Datei im Repository existiert

### Problem: Sprache wird nicht neu geladen

**Lösung:**
1. Prüfen Sie, ob `updated()` im Repository-Dashboard korrekt implementiert ist
2. Prüfen Sie, ob `hass.language` sich tatsächlich ändert
3. Laden Sie die Seite neu, nachdem Sie die Sprache geändert haben

## 10. Nützliche Befehle

```bash
# Frontend starten
yarn start

# Frontend bauen
yarn build

# Tests ausführen (falls konfiguriert)
yarn test

# Linter prüfen
yarn lint

# TypeScript prüfen
yarn type-check
```

## Weitere Ressourcen

- [HACS Frontend Dokumentation](https://hacs.xyz/docs/contribute/frontend/)
- [Home Assistant Frontend Entwickler-Dokumentation](https://developers.home-assistant.io/docs/frontend/)
- [BCP47 Sprachcodes](https://en.wikipedia.org/wiki/IETF_language_tag)

