import { manifests as entrypoints } from "./entrypoints/manifest.js";
import { manifests as workspaceViews } from "./workspace-views/manifest.js";

export const manifests = [
    ...entrypoints,
    ...workspaceViews,
];
