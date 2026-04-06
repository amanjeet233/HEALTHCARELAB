# Contributing to HealthLab

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and configure
4. Start the dev server: `npm run dev`

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — auto-deploys to Vercel |
| `develop` | Integration branch for features |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `docs/*` | Documentation changes |

## Pull Request Process

1. **Create a feature branch** from `develop`
2. **Write clean code** — follow the existing patterns and ESLint rules
3. **Type-check** — run `npx tsc -b --noEmit` before submitting
4. **Lint** — run `npm run lint` and fix all warnings
5. **Build** — ensure `npm run build` passes with zero errors
6. **Describe your changes** — write a clear PR description
7. **Request review** — tag at least one maintainer

## Code Style

- **TypeScript** — strict mode, no `any` unless absolutely necessary
- **React** — functional components with hooks, no class components
- **CSS** — Tailwind utility classes, avoid inline styles
- **Naming** — PascalCase for components, camelCase for functions/variables
- **Files** — one component per file, named same as the component

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add patient booking history page
fix: resolve dark mode toggle persistence
docs: update README with deployment steps
refactor: extract booking card into separate component
```

## Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

## Feature Requests

Open an issue with the `enhancement` label describing:
- The problem you're trying to solve
- Your proposed solution
- Alternative approaches you considered
