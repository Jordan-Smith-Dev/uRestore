# uRestore

[![Downloads](https://img.shields.io/nuget/dt/Umbraco.Community.uRestore?color=cc9900)](https://www.nuget.org/packages/Umbraco.Community.uRestore/)
[![NuGet](https://img.shields.io/nuget/vpre/Umbraco.Community.uRestore?color=0273B3)](https://www.nuget.org/packages/Umbraco.Community.uRestore)
[![GitHub license](https://img.shields.io/github/license/Jordan-Smith-Dev/uRestore?color=8AB803)](https://github.com/Jordan-Smith-Dev/uRestore/blob/main/LICENSE)

Selectively restore individual property values from any saved content version — directly inside the Umbraco backoffice.

uRestore adds a **Property Restore** tab to every content node workspace. Editors can browse version history, compare any saved version against the current draft property-by-property, and choose exactly which values to restore — without affecting the properties they want to keep.

![uRestore version history panel showing saved versions with status pills](https://raw.githubusercontent.com/Jordan-Smith-Dev/uRestore/main/docs/uRestore_preview-001.png)

## Features

- **Version history panel** — lists all saved versions of the current content node with date and status (draft / published / saved)
- **Property-level comparison** — side-by-side diff of the current draft value and the value from any selected version, with inline change highlighting
- **Selective restore** — choose exactly which properties to restore; all others remain unchanged
- **Smart pre-selection** — properties that differ from the current draft are automatically pre-selected
- **Culture-aware** — filter the comparison by language variant for multilingual sites
- **Non-destructive** — restored values are saved as a new draft and never auto-published
- **Save & Publish shortcut** — optionally publish immediately after restoring from the confirmation dialog
- **Native UI** — built with Umbraco UI Library components so it looks and feels like part of the backoffice

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
2. Click the **Property Restore** tab
3. Click **Compare** on any version to see a property-by-property diff
4. Select the properties you want to restore and click **Restore selected**
5. Choose to save as draft or save and publish from the confirmation dialog

![uRestore property comparison view with inline diff highlighting and selective restore](https://raw.githubusercontent.com/Jordan-Smith-Dev/uRestore/main/docs/uRestore_preview-002.png)

## Source & Issues

- GitHub: https://github.com/Jordan-Smith-Dev/uRestore
- Issues: https://github.com/Jordan-Smith-Dev/uRestore/issues
