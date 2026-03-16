# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-16

### Added

- **Property Restore** workspace tab on all content nodes
- Version history panel listing all saved versions with date and status (draft / published / saved)
- Property-level side-by-side comparison between the current draft and any selected version
- Inline diff highlighting — red for removed text, green for added text
- Selective restore — choose exactly which properties to restore; all others remain unchanged
- Smart pre-selection of changed properties
- Culture-aware filtering for multilingual sites
- Non-destructive save — restored values are saved as a new draft, never auto-published
- Save & Publish shortcut from the confirmation dialog
- Pagination for version history (10 versions per page, pinned versions shown first)
- Native Umbraco UI Library components throughout
