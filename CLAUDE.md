# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React component library (`@emd-cloud/react-components`) that provides hooks and components for interacting with the EMD Cloud platform. The library is built with TypeScript and provides a React wrapper around the EMD Cloud SDK, offering authentication, file upload functionality, and integration with the EMD Cloud services.

## Build and Development Commands

### Core Commands
- `npm install` - Install dependencies
- `npm run build` - Build the library (cleans dist/, compiles TypeScript, and bundles with Rollup)
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run storybook` - Start Storybook development server on port 6006
- `npm run build-storybook` - Build Storybook for production
- `npm run prettier:formating` - Format code in src/ directory

### Testing
- Tests use Vitest with Happy DOM environment
- Test files are located in `tests/` directory with `.test.tsx` extensions
- Run a single test file: `npm test [filename]`
- Comprehensive test coverage for authentication methods and components
- Mock SDK integration for testing without external dependencies

## Architecture

### Project Structure
- `src/` - Source code
  - `components/` - React components (ApplicationProvider)
  - `hooks/` - Custom React hooks (useAuth, useUploader, useDropzone)
  - `tools/` - Utility modules (uploader.ts)
  - `stories/` - Storybook stories
- `tests/` - Test files organized by feature
- `dist/` - Built output (gitignored)

### Build System
- **TypeScript**: Compiles to ES2018, outputs to `out-tsc/`
- **Rollup**: Creates three builds:
  1. Minified ES module bundle
  2. ES modules with source maps (preserves module structure)
  3. TypeScript declarations (.d.ts files)
- **Vite**: Used for testing and Storybook

### Key Dependencies
- `@emd-cloud/sdk` - Peer dependency providing core EMD Cloud functionality
- `tus-js-client` - Resumable file upload protocol
- `react` & `react-dom` - Peer dependencies (v16.8+ through v19)
- Semantic Release for automated versioning and publishing

### Main Exports
The library exports:
- **Hooks**: `useAuth` (comprehensive auth with SDK integration), `useUploader`, `useDropzone`
- **Components**: `ApplicationProvider` (manages SDK instance and application state)

### SDK Integration Architecture
- **ApplicationProvider** automatically initializes and manages the EMD Cloud SDK instance
- **useAuth** hook uses SDK methods instead of direct API calls
- Graceful fallback when SDK is not installed
- Dynamic SDK loading to avoid runtime errors
- Centralized token management through SDK

### Authentication Methods Available
- **Basic Auth**: Email/password login and registration
- **Social Auth**: OAuth integration with VK and Yandex
- **Password Recovery**: Complete forgot password flow with email verification
- **Token Management**: Automatic token handling through SDK
- **Authorization**: Token-based authentication verification

### Release Process
- Uses semantic-release with conventional commits
- Automatically triggered on push to main branch via GitHub Actions
- Publishes to npm with public access
- Creates GitHub releases with notes

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- Module resolution: Node with ESNext modules
- JSX: React mode
- Base URL set to `src/` for imports
- All authentication logic delegates to SDK for consistency

### Integration Notes
- Always check SDK availability before calling methods
- Use proper error handling for SDK method failures
- Maintain backward compatibility with existing API
- Test SDK integration with mocks to avoid external dependencies