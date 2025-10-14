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

## 📖 Dokumentation

- **[Komponenten-Dokumentation](./docs/COMPONENTS.md)**: Automatisch generierte Übersicht aller Komponenten
- **[Projekt-Regeln](./docs/WARP.md)**: Entwicklungsrichtlinien und Standards

### Living Documentation

Die Komponenten-Dokumentation wird automatisch aus dem Quellcode generiert und bei jedem Build sowie vor jedem Commit aktualisiert.

**Dokumentation manuell generieren:**

```bash
pnpm run docs:components
```

**Dokumentation im Watch-Modus:**

```bash
pnpm run docs:components:watch
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
