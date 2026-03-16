import type { ManifestBackofficeEntryPoint } from "@umbraco-cms/backoffice/extension-registry";

export const manifests: ManifestBackofficeEntryPoint[] = [
    {
        name: "uRestore Entry Point",
        alias: "Umbraco.Community.uRestore.EntryPoint",
        type: "backofficeEntryPoint",
        js: () => import("./entrypoint.js"),
    },
];
