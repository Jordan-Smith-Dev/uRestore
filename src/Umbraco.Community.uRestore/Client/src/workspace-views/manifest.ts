import type { ManifestWorkspaceView } from "@umbraco-cms/backoffice/workspace";

export const manifests: ManifestWorkspaceView[] = [
    {
        name: "uRestore Workspace View",
        alias: "Umbraco.Community.uRestore.WorkspaceView",
        type: "workspaceView",
        js: () => import("./workspace-view.element.js"),
        weight: 50,
        meta: {
            label: "Property Restore",
            pathname: "property-restore",
            icon: "icon-history",
        },
        conditions: [
            {
                alias: "Umb.Condition.WorkspaceAlias",
                match: "Umb.Workspace.Document",
            },
        ],
    },
];
