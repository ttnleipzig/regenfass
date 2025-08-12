# Regenfass Installer

Ein moderner Installer für das Regenfass-Projekt, entwickelt mit SolidJS und Vite.

## 🚀 Features

- **Moderne UI**: Entwickelt mit SolidJS und Tailwind CSS
- **Komponenten-Bibliothek**: Vollständig dokumentiert mit Storybook
- **Tests**: Umfassende Testabdeckung mit Vitest
- **TypeScript**: Vollständig typisiert für bessere Entwicklererfahrung

## 📦 Installation

```bash
pnpm install
```

## 🛠️ Entwicklung

### Entwicklungsserver starten
```bash
pnpm dev
```

### Storybook starten
```bash
pnpm storybook
```

### Tests ausführen
```bash
pnpm test
```

### Tests mit UI
```bash
pnpm test:ui
```

### Testabdeckung
```bash
pnpm test:coverage
```

## 🧩 Komponenten

### Atoms
- **Link**: Wiederverwendbare Link-Komponente mit externer/interner Link-Erkennung
- **Confetti**: Animierte Confetti-Komponente für Erfolgsfeiern
- **ConfettiSpinner**: Ladeanimation mit Confetti-Effekt

### Molecules
- **Status**: Statusanzeige mit verschiedenen Zuständen (idle, loading, success, error)
- **Flasher**: Firmware-Flashing-Komponente mit Port- und Firmware-Auswahl

### Organisms
- **Header**: Hauptnavigation mit Logo und Menü
- **Footer**: Fußbereich mit Links und Informationen
- **Welcome**: Willkommensseite für neue Benutzer
- **Newsletter**: Newsletter-Anmeldung

## 🧪 Testing

Das Projekt verwendet Vitest für Unit-Tests und @testing-library für Komponententests.

### Test-Struktur
```
src/
├── components/
│   ├── atoms/
│   │   ├── Link.test.tsx
│   │   └── ...
│   ├── molecules/
│   │   ├── Status.test.tsx
│   │   └── ...
│   └── organisms/
│       ├── Header.test.tsx
│       └── ...
└── test/
    └── setup.ts
```

### Test-Ausführung
- `pnpm test`: Führt alle Tests aus
- `pnpm test:ui`: Öffnet die Vitest UI
- `pnpm test:coverage`: Generiert Testabdeckungsbericht

## 📚 Storybook

Storybook bietet eine interaktive Dokumentation aller Komponenten:

- **Lokale URL**: http://localhost:6006/
- **Komponenten-Übersicht**: Alle Komponenten sind nach Atomic Design organisiert
- **Interaktive Controls**: Props können live angepasst werden
- **Automatische Dokumentation**: Jede Komponente wird automatisch dokumentiert

### Story-Struktur
```
src/stories/
├── atoms/
│   ├── Link.stories.tsx
│   ├── Confetti.stories.tsx
│   └── ConfettiSpinner.stories.tsx
├── molecules/
│   ├── Status.stories.tsx
│   └── Flasher.stories.tsx
└── organisms/
    ├── Header.stories.tsx
    ├── Footer.stories.tsx
    ├── Welcome.stories.tsx
    └── Newsletter.stories.tsx
```

## 🏗️ Build

```bash
pnpm build
```

## 🎨 Styling

Das Projekt verwendet Tailwind CSS für das Styling. Alle Komponenten sind responsive und folgen modernen Design-Prinzipien.

## 📝 Contributing

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Schreibe Tests für neue Features
4. Stelle sicher, dass alle Tests bestehen
5. Erstelle einen Pull Request

## 📄 Lizenz

MIT License
