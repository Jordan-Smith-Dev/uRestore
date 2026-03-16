# uRestore

[![Downloads](https://img.shields.io/nuget/dt/Umbraco.Community.uRestore?color=cc9900)](https://www.nuget.org/packages/Umbraco.Community.uRestore/)
[![NuGet](https://img.shields.io/nuget/v/Umbraco.Community.uRestore?color=0273B3)](https://www.nuget.org/packages/Umbraco.Community.uRestore)
[![License](https://img.shields.io/github/license/Jordan-Smith-Dev/Umbraco.Community.uRestore?color=8AB803)](LICENSE)
[![Umbraco Marketplace](https://img.shields.io/badge/Umbraco-Marketplace-%233544B1?logo=umbraco)](https://marketplace.umbraco.com/listing/Umbraco.Community.uRestore)

Selectively restore individual property values from any saved content version — directly inside the Umbraco backoffice.

uRestore adds a **Property Restore** tab to every content node workspace. From that tab, editors can browse the full version history, compare any saved version against the current draft property-by-property, and choose exactly which values to restore — without affecting the properties they want to keep.

![uRestore version history panel showing saved versions with status pills](../docs/uRestore_preview-001.png)

## Features

- **Version history panel** — lists all saved versions of the current content node with date and status (draft / published / saved)
- **Property-level comparison** — side-by-side diff of the current draft value and the value from any selected version, with inline change highlighting
- **Selective restore** — choose exactly which properties to restore; all others remain unchanged
- **Smart pre-selection** — properties that differ from the current draft are automatically pre-selected
- **Culture-aware** — filter the comparison by language variant for multilingual sites
- **Non-destructive** — restored values are saved as a new draft and never auto-published
- **Save & Publish shortcut** — optionally publish immediately after restoring from the confirmation dialog
- **Native UI** — built with Umbraco UI Library components so it looks and feels like part of the backoffice

## What it doesn't do

- It does not replace the built-in rollback feature on the Info tab — it complements it
- It does not publish restored content automatically; editors retain full control
- It does not handle block-level partial restores within complex property editors (e.g. Block List, Block Grid) — the entire property value is restored as a whole
- It does not support restoring media or member properties

## Requirements

- Umbraco 17+
- .NET 10+

## Installation

```bash
dotnet add package Umbraco.Community.uRestore
```

No configuration is required. After installing the package and restarting your site, a **Property Restore** tab will appear in the content editor for all document types.

## Usage

1. Open any content node in the backoffice
2. Click the **Property Restore** tab (alongside Content, Info, etc.)
3. The tab lists all saved versions — click **Compare** on any version
4. Review the property-by-property diff; changed properties are pre-selected
5. Deselect any properties you want to keep at their current value
6. Click **Restore selected** — a confirmation dialog appears with Save as draft or Save & Publish options
7. Review and publish the draft as normal when ready

## Screenshots

![uRestore version history panel showing saved versions with status pills](../docs/uRestore_preview-001.png)

![uRestore property comparison view with inline diff highlighting and selective restore](../docs/uRestore_preview-002.png)

## Contributing

Contributions are welcome! Please read the [Contributing Guidelines](CONTRIBUTING.md).

## Issues

Please report bugs and feature requests on the [GitHub Issues](https://github.com/Jordan-Smith-Dev/Umbraco.Community.uRestore/issues) page.

## License

[MIT](../LICENSE)
