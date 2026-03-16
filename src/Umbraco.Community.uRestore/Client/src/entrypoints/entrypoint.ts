import type { UmbEntryPointOnInit, UmbEntryPointOnUnload } from "@umbraco-cms/backoffice/extension-api";

// The entrypoint runs once at backoffice startup. No global setup is required
// for uRestore — all context is consumed within the workspace view element itself.
export const onInit: UmbEntryPointOnInit = (_host, _extensionRegistry) => {
    // intentionally empty
};

export const onUnload: UmbEntryPointOnUnload = (_host, _extensionRegistry) => {
    // intentionally empty
};
