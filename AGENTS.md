# Repository Guidelines

## Project Structure & Module Organization
- `src/`: Library source code.
  - `components/`: Reusable React components (PascalCase folders).
  - `hooks/`: Reusable hooks (files/folders start with `use*`).
  - `stories/`: Storybook stories for components/hooks.
  - `tools/`, `types/`, `index.ts`: Public entry and shared types.
- `tests/`: Vitest specs mirroring `src/` (e.g., `tests/hooks/useX/index.test.tsx`).
- `dist/`: Build output (committed on publish only).

## Build, Test, and Development Commands
- `npm run build`: Clean `dist` and build with Rollup.
- `npm test`: Run Vitest once (DOM via `happy-dom`).
- `npm run test:watch`: Watch mode for tests.
- `npm run typecheck`: TypeScript type checking without emit.
- `npm run storybook`: Launch Storybook at `http://localhost:6006`.
- `npm run build-storybook`: Static Storybook build.
- `npm run prettier:formatting`: Format `src/` with Prettier.

## Coding Style & Naming Conventions
- Language: TypeScript, ES modules.
- Formatting: Prettier (2 spaces, single quotes, no semicolons, trailing commas).
- Linting: ESLint (`eslint.config.js`) with TS + React presets.
- Components: PascalCase (`src/components/FileUploader/`).
- Hooks: camelCase starting with `use` (`src/hooks/useUploader/`).
- Tests: mirror path; file name `index.test.tsx` or `ComponentName.test.tsx`.

## Testing Guidelines
- Frameworks: Vitest + Testing Library; DOM: `happy-dom`.
- Location: place specs under `tests/` mirroring `src/` structure.
- Env config: `tests/config.ts` reads `TEST_PLATFORM_API_URL`, `TEST_PLATFORM_APP_ID`, `TEST_PLATFORM_API_TOKEN`.
- Run locally with `npm test` (use `test:watch` during development).

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (e.g., `feat:`, `fix:`, `build:`, `ci:`, `chore:`). Example: `feat(uploader): add retry option`.
- PRs: clear description, motivation, and scope; link issues (e.g., `EMD-1234`); include Storybook screenshots for UI changes; note breaking changes.
- Quality gate: ensure `npm test`, `npm run typecheck`, and `npm run build` pass; update README/Storybook where relevant.

## Security & Configuration Tips
- Do not commit secrets. Use environment variables for tests only.
- Respect peer dependencies: consumers must install `react`, `react-dom`, and `@emd-cloud/sdk`.
