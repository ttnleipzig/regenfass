# Regenfass Installer

![Regenfass Installer](https://raw.githubusercontent.com/ttnleipzig/regenfass-brand/main/examples/github/sample-readme-header-regenfass-installer.svg)

A modern installer for the Regenfass project, built with SolidJS and Vite.

The installer runs in a supported browser and guides users through flashing and configuring Regenfass hardware.

## 🚀 Features

- **Modern UI**: Built with SolidJS and Tailwind CSS
- **Component Library**: Fully documented with comprehensive examples
- **Tests**: Comprehensive test coverage with Vitest
- **TypeScript**: Fully typed for better developer experience

## 📦 Installation

```bash
pnpm install
```

## 🛠️ Development

### Start Development Server

```bash
pnpm dev
```

### Run Tests

```bash
pnpm test
```

### Run Tests with UI

```bash
pnpm test:ui
```

### Test Coverage

```bash
pnpm test:coverage
```

## 📖 Documentation

- **[Component Documentation](./docs/COMPONENTS.md)**: Auto-generated overview of all components
- **[Project Rules](./docs/WARP.md)**: Development guidelines and standards

### Living Documentation

Component documentation is automatically generated from source code and updated on every build and before each commit.

**Generate documentation manually:**

```bash
pnpm run docs:components
```

**Watch mode for documentation:**

```bash
pnpm run docs:components:watch
```

## 🏗️ Build

```bash
pnpm build
```

## Requirements

- Node.js 20 or newer
- pnpm (use the version configured by the repository)
- A Chromium-based browser and USB access for hardware flashing

Run commands from the repository root or from this directory. The shared UI components come from [`@regenfass/brand`](../brand/README.md).

## 🎨 Styling

The project uses Tailwind CSS for styling. All components are responsive and follow modern design principles.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Create a pull request

## 📄 License

MIT License
