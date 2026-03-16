# Contributing

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 22+](https://nodejs.org/)

## Getting started

1. Clone the repository
2. Build the frontend:
   ```bash
   cd src/Umbraco.Community.uRestore/Client
   npm install
   npm run build
   ```
3. Run the test site:
   ```bash
   cd src/Umbraco.Community.uRestore.TestSite
   dotnet run
   ```
4. For frontend hot reload, use watch mode:
   ```bash
   cd src/Umbraco.Community.uRestore/Client
   npm run watch
   ```
5. To regenerate the API TypeScript client after API changes:
   ```bash
   npm run generate-client
   ```
   This requires the test site to be running at `https://localhost:44345`.

## Project structure

- `src/Umbraco.Community.uRestore/` — the package (Razor Class Library)
  - `Client/` — TypeScript/Lit frontend (Vite)
  - `Controllers/` — Backoffice API controllers
  - `Composers/` — Umbraco composer registrations
  - `Models/` — API request/response models
  - `Services/` — Core service logic
- `src/Umbraco.Community.uRestore.TestSite/` — test/development Umbraco site

## API

The package exposes three endpoints under `/umbraco/umbracommunityurestore/api/v1/`:

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `content/{contentId}/versions` | List saved versions |
| `GET`  | `content/{contentId}/version/{versionId}/properties` | Compare properties |
| `POST` | `content/{contentId}/restore` | Restore selected properties |

The Swagger UI is available at `/umbraco/swagger` (non-production only) under the `umbracommunityurestore` group.

## Submitting changes

Please open a pull request with a clear description of your changes.
