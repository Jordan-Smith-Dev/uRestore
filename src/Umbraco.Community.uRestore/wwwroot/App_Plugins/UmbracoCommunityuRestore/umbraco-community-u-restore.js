const e = [
  {
    name: "uRestore Entry Point",
    alias: "Umbraco.Community.uRestore.EntryPoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-BbtUKYiT.js")
  }
], o = [
  {
    name: "uRestore Workspace View",
    alias: "Umbraco.Community.uRestore.WorkspaceView",
    type: "workspaceView",
    js: () => import("./workspace-view.element-BzlAcIjA.js"),
    weight: 50,
    meta: {
      label: "Property Restore",
      pathname: "property-restore",
      icon: "icon-history"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "Umb.Workspace.Document"
      }
    ]
  }
], t = [
  ...e,
  ...o
];
export {
  t as manifests
};
//# sourceMappingURL=umbraco-community-u-restore.js.map
