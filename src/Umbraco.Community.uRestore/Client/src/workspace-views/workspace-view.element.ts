import {
    LitElement,
    css,
    html,
    customElement,
    state,
    nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT } from "@umbraco-cms/backoffice/notification";
import type { UmbAuthContext } from "@umbraco-cms/backoffice/auth";
import type { UmbNotificationContext } from "@umbraco-cms/backoffice/notification";
import { diffWords, diffLines } from "diff";
import {
    getVersions,
    getVersionProperties,
    restoreProperties,
    publishContent,
    type ContentVersionModel,
    type PropertyComparisonModel,
} from "../api/index.js";

type ViewState =
    | { type: "loading" }
    | { type: "versions"; versions: ContentVersionModel[] }
    | { type: "comparing" }
    | { type: "detail"; version: ContentVersionModel; properties: PropertyComparisonModel[] }
    | { type: "error"; message: string };

const PAGE_SIZE = 10;

@customElement("umb-u-restore-workspace-view")
export class UmbURestoreWorkspaceViewElement extends UmbElementMixin(LitElement) {
    @state() private _view: ViewState = { type: "loading" };
    @state() private _contentId: string = "";
    @state() private _selectedAliases: Set<string> = new Set();
    @state() private _isRestoring: boolean = false;
    @state() private _showConfirm: boolean = false;
    @state() private _totalVersions: number = 0;
    @state() private _currentPage: number = 1;
    @state() private _culture: string = "";

    get #cultureError(): string {
        if (this._culture === "") return "";
        return this.#isValidCulture(this._culture)
            ? ""
            : "Enter a valid culture code (e.g. en-US, fr-FR) or leave blank for invariant.";
    }

    private _authContext?: UmbAuthContext;
    private _notificationContext?: UmbNotificationContext;
    private _workspaceCtx?: { load: (unique: string) => Promise<unknown> };

    override connectedCallback(): void {
        super.connectedCallback();
        this.#consumeContexts();
    }

    #consumeContexts(): void {
        this.consumeContext(UMB_AUTH_CONTEXT, (ctx) => { this._authContext = ctx; });
        this.consumeContext(UMB_NOTIFICATION_CONTEXT, (ctx) => { this._notificationContext = ctx; });
        this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (ctx) => {
            if (!ctx) return;
            this._workspaceCtx = ctx as typeof this._workspaceCtx;
            this.observe(ctx.unique, async (unique) => {
                if (unique && unique !== this._contentId) {
                    this._contentId = unique;
                    await this.#loadVersions(1);
                }
            });
        });
    }

    async #getToken(): Promise<string> {
        const config = this._authContext?.getOpenApiConfiguration();
        if (!config?.token) return "";
        if (typeof config.token === "function") {
            const result = config.token();
            return (result instanceof Promise ? await result : result) ?? "";
        }
        return config.token;
    }

    async #loadVersions(page = this._currentPage): Promise<void> {
        this._currentPage = page;
        this._view = { type: "loading" };
        try {
            const token = await this.#getToken();
            const skip = (page - 1) * PAGE_SIZE;
            const { versions, total } = await getVersions(
                this._contentId, token,
                this._culture || undefined,
                skip, PAGE_SIZE
            );
            this._totalVersions = total;
            this._view = { type: "versions", versions };
        } catch (e) {
            this._view = { type: "error", message: e instanceof Error ? e.message : "Failed to load version history." };
        }
    }

    async #loadVersionComparison(version: ContentVersionModel): Promise<void> {
        this._view = { type: "comparing" };
        this._selectedAliases = new Set();
        try {
            const token = await this.#getToken();
            const properties = await getVersionProperties(
                this._contentId, version.versionId, token,
                this._culture || undefined
            );
            this._selectedAliases = new Set(properties.filter((p) => p.hasChanges).map((p) => p.alias));
            this._view = { type: "detail", version, properties };
        } catch (e) {
            this._view = { type: "error", message: e instanceof Error ? e.message : "Failed to load property comparison." };
        }
    }

    #backToVersionList(): void { this.#loadVersions(this._currentPage); }

    #isValidCulture(value: string): boolean {
        return value === "" || /^[a-zA-Z]{2,8}(-[a-zA-Z0-9]{2,8})*$/.test(value);
    }

    #onCultureChange(value: string): void {
        this._culture = value;
        if (!this.#isValidCulture(value)) return;
        this.#loadVersions(1);
    }

    #clearCultureFilter(): void {
        this._culture = "";
        this.#loadVersions(1);
    }

    #toggleProperty(alias: string): void {
        const next = new Set(this._selectedAliases);
        if (next.has(alias)) next.delete(alias); else next.add(alias);
        this._selectedAliases = next;
    }

    #toggleSelectAll(event: Event): void {
        if (this._view.type !== "detail") return;
        const checked = (event.target as HTMLInputElement).checked;
        this._selectedAliases = checked
            ? new Set(this._view.properties.map((p) => p.alias))
            : new Set();
    }

    #openConfirm(): void {
        if (this._view.type !== "detail" || this._selectedAliases.size === 0) return;
        this._showConfirm = true;
    }

    async #confirmRestore(publish: boolean): Promise<void> {
        this._showConfirm = false;
        if (this._view.type !== "detail") return;
        const { version } = this._view;
        this._isRestoring = true;
        try {
            const token = await this.#getToken();
            const result = await restoreProperties(this._contentId, {
                versionId: version.versionId,
                propertyAliases: Array.from(this._selectedAliases),
                culture: this._culture || null,
            }, token);

            if (!result.ok) {
                this._notificationContext?.peek("danger", { data: { headline: "Restore failed", message: result.error ?? "An unexpected error occurred." } });
                return;
            }

            if (publish) {
                const pubResult = await publishContent(this._contentId, token);
                this._notificationContext?.peek(pubResult.ok ? "positive" : "warning", {
                    data: pubResult.ok
                        ? { headline: "Restored and published", message: `${this._selectedAliases.size} ${this._selectedAliases.size === 1 ? "property" : "properties"} restored and published.` }
                        : { headline: "Restored but not published", message: pubResult.error ?? "Draft saved but could not be published." }
                });
            } else {
                this._notificationContext?.peek("positive", { data: { headline: "Properties restored", message: `${this._selectedAliases.size} ${this._selectedAliases.size === 1 ? "property" : "properties"} restored as a draft.` } });
            }
            await Promise.all([
                this.#loadVersions(1),
                this._workspaceCtx?.load(this._contentId),
            ]);
        } finally {
            this._isRestoring = false;
        }
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    #formatDate(iso: string): string {
        return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
    }

    /** Format a raw property value for display — pretty-prints JSON, leaves plain strings as-is. */
    #formatValue(raw: string | null): string {
        if (!raw) return "";
        try {
            return JSON.stringify(JSON.parse(raw), null, 2);
        } catch {
            return raw;
        }
    }

    #isJson(raw: string | null): boolean {
        if (!raw) return false;
        try { JSON.parse(raw); return true; } catch { return false; }
    }

    /** Render a plain (no diff) value cell. */
    #renderPlainValue(value: string | null) {
        if (!value) return html`<em class="value-empty">empty</em>`;
        return html`<pre class="value-preview">${this.#formatValue(value)}</pre>`;
    }

    /**
     * Render the historical value with inline diff highlighting against the current draft.
     * Green  = will be added if restored.
     * Red    = will be removed if restored.
     */
    #renderDiffValue(historicalValue: string | null, currentValue: string | null) {
        if (!historicalValue && !currentValue) return html`<em class="value-empty">empty</em>`;

        const hist = this.#formatValue(historicalValue);
        const curr = this.#formatValue(currentValue);

        const changes = this.#isJson(historicalValue) || this.#isJson(currentValue)
            ? diffLines(curr, hist)
            : diffWords(curr, hist);

        return html`
            <pre class="value-preview diff-preview">${changes.map((part) =>
                part.removed
                    ? html`<span class="diff-removed">${part.value}</span>`
                    : part.added
                        ? html`<span class="diff-added">${part.value}</span>`
                        : part.value
            )}</pre>
        `;
    }

    // ─── Version list ──────────────────────────────────────────────────────────

    #renderVersionList(versions: ContentVersionModel[]) {
        const totalPages = Math.ceil(this._totalVersions / PAGE_SIZE);

        if (versions.length === 0) {
            return html`
                <uui-box>
                    <div class="empty-state">
                        <uui-icon name="icon-history"></uui-icon>
                        ${this._culture
                            ? html`
                                <p>No saved versions found for culture <strong>${this._culture}</strong>.</p>
                                <uui-button look="primary" label="Clear filter" @click=${this.#clearCultureFilter}>
                                    Clear filter
                                </uui-button>`
                            : html`<p>No saved versions found for this content.</p>`}
                    </div>
                </uui-box>
            `;
        }

        return html`
            <div class="view-header">
                <div>
                    <h4 class="view-title">Property Restore</h4>
                    <p class="hint">Select a version to compare its properties against the current draft, then choose which values to restore.</p>
                </div>
                <uui-button look="primary" label="Refresh" @click=${() => this.#loadVersions(1)}>
                    <uui-icon name="icon-refresh"></uui-icon>
                    Refresh
                </uui-button>
            </div>

            <uui-box>
                <div class="culture-section">
                    <div class="culture-row">
                        <uui-label for="culture-input">Culture</uui-label>
                        <uui-input
                            id="culture-input"
                            placeholder="e.g. en-US (leave blank for invariant)"
                            .value=${this._culture}
                            ?error=${!!this.#cultureError}
                            @change=${(e: Event) => this.#onCultureChange((e.target as HTMLInputElement).value)}>
                        </uui-input>
                    </div>
                    ${this.#cultureError
                        ? html`<p class="culture-error">${this.#cultureError}</p>`
                        : html`<p class="hint">
                            For multilingual sites, enter a culture code to compare property values for that specific language.
                            Leave blank to compare invariant (non-language-specific) values.
                            Versions are document-wide snapshots — this filter only affects which language's values are shown in the comparison.
                        </p>`}
                </div>

                <uui-table>
                    <uui-table-head>
                        <uui-table-head-cell>Version</uui-table-head-cell>
                        <uui-table-head-cell>Status</uui-table-head-cell>
                        <uui-table-head-cell></uui-table-head-cell>
                    </uui-table-head>

                    ${versions.map((v) => html`
                        <uui-table-row>
                            <uui-table-cell class="cell-date">
                                <uui-icon name="icon-history" class="row-icon"></uui-icon>
                                ${this.#formatDate(v.createDate)}
                            </uui-table-cell>
                            <uui-table-cell class="cell-status">
                                ${v.isCurrentDraft ? html`<uui-tag color="warning" look="primary" size="s">Current draft</uui-tag>` : nothing}
                                ${v.isCurrentPublished ? html`<uui-tag color="positive" look="primary" size="s">Published</uui-tag>` : nothing}
                                ${!v.isCurrentDraft && !v.isCurrentPublished ? html`<uui-tag look="outline" size="s">Saved</uui-tag>` : nothing}
                                ${v.preventCleanup ? html`<uui-tag look="outline" size="s">Pinned</uui-tag>` : nothing}
                            </uui-table-cell>
                            <uui-table-cell class="cell-action">
                                <uui-button
                                    look="secondary"
                                    label="Compare with current draft"
                                    ?disabled=${v.isCurrentDraft}
                                    @click=${() => this.#loadVersionComparison(v)}>
                                    Compare
                                </uui-button>
                            </uui-table-cell>
                        </uui-table-row>
                    `)}
                </uui-table>
            </uui-box>

            ${totalPages > 1 ? html`
                <div class="pagination-bar">
                    <uui-pagination
                        .total=${totalPages}
                        .current=${this._currentPage}
                        @change=${(e: CustomEvent) => this.#loadVersions((e.target as any).current)}>
                    </uui-pagination>
                </div>
            ` : nothing}
        `;
    }

    // ─── Comparison detail ─────────────────────────────────────────────────────

    #renderDetail(version: ContentVersionModel, properties: PropertyComparisonModel[]) {
        const selectedCount = this._selectedAliases.size;
        const allSelected = selectedCount === properties.length;
        const changedCount = properties.filter((p) => p.hasChanges).length;

        return html`
            <div class="detail-header">
                <uui-button look="primary" label="Back" @click=${this.#backToVersionList}>
                    <uui-icon name="icon-arrow-left"></uui-icon>
                    Back
                </uui-button>
            </div>

            <uui-box>
                <div slot="headline">
                    Property Restore &mdash; Version from ${this.#formatDate(version.createDate)}
                </div>

                <p class="hint comparison-hint">
                    ${version.isCurrentDraft
                        ? html`<uui-tag color="warning" look="primary" size="s" class="status-pill">Current draft</uui-tag>`
                        : version.isCurrentPublished
                            ? html`<uui-tag color="positive" look="primary" size="s" class="status-pill">Published</uui-tag>`
                            : html`<uui-tag look="outline" size="s" class="status-pill">Saved</uui-tag>`}
                    ${changedCount > 0
                        ? html`<strong>${changedCount} ${changedCount === 1 ? "property differs" : "properties differ"}</strong>
                               from the current draft and ${changedCount === 1 ? "has been" : "have been"} pre-selected.
                               Deselect any you do not want to restore.`
                        : "This version is identical to the current draft. You can still select properties to overwrite."}
                </p>

                <p class="diff-legend-block">
                    <span class="diff-legend-removed">Red text will be removed</span> in the selected version,
                    <span class="diff-legend-added">green text will be added</span>.
                </p>

                <uui-table>
                    <uui-table-head>
                        <uui-table-head-cell class="checkbox-cell">
                            <uui-checkbox
                                label="Select all"
                                .checked=${allSelected}
                                .indeterminate=${selectedCount > 0 && !allSelected}
                                @change=${this.#toggleSelectAll}>
                            </uui-checkbox>
                        </uui-table-head-cell>
                        <uui-table-head-cell class="col-property">Property</uui-table-head-cell>
                        <uui-table-head-cell class="col-status">Status</uui-table-head-cell>
                        <uui-table-head-cell>Current draft value</uui-table-head-cell>
                        <uui-table-head-cell>Value in this version</uui-table-head-cell>
                    </uui-table-head>

                    ${properties.map((prop) => html`
                        <uui-table-row
                            class="${prop.hasChanges ? "row-changed" : ""}"
                            selectable
                            ?selected=${this._selectedAliases.has(prop.alias)}
                            @click=${() => this.#toggleProperty(prop.alias)}>

                            <uui-table-cell class="checkbox-cell" @click=${(e: Event) => e.stopPropagation()}>
                                <uui-checkbox
                                    label="Select ${prop.label}"
                                    .checked=${this._selectedAliases.has(prop.alias)}
                                    @change=${() => this.#toggleProperty(prop.alias)}>
                                </uui-checkbox>
                            </uui-table-cell>

                            <uui-table-cell class="col-property cell-value">
                                <div class="property-meta">
                                    <span class="property-meta-label">Name</span>
                                    <span class="property-name">${prop.label}</span>
                                </div>
                                <div class="property-meta">
                                    <span class="property-meta-label">Alias</span>
                                    <span class="property-alias">${prop.alias}</span>
                                </div>
                                <div class="property-meta">
                                    <span class="property-meta-label">Editor</span>
                                    <span class="property-alias">${prop.editorAlias}</span>
                                </div>
                            </uui-table-cell>

                            <uui-table-cell class="col-status cell-status">
                                ${prop.hasChanges
                                    ? html`<uui-tag color="danger" look="primary" size="s">Changed</uui-tag>`
                                    : html`<uui-tag look="outline" size="s">Unchanged</uui-tag>`}
                            </uui-table-cell>

                            <uui-table-cell class="cell-value">
                                ${this.#renderPlainValue(prop.currentValue)}
                            </uui-table-cell>

                            <uui-table-cell class="cell-value">
                                ${prop.hasChanges
                                    ? this.#renderDiffValue(prop.historicalValue, prop.currentValue)
                                    : this.#renderPlainValue(prop.historicalValue)}
                            </uui-table-cell>
                        </uui-table-row>
                    `)}
                </uui-table>
            </uui-box>

            <div class="actions-footer">
                <span class="selection-count">
                    ${selectedCount === 0
                        ? "No properties selected"
                        : `${selectedCount} ${selectedCount === 1 ? "property" : "properties"} selected`}
                </span>
                <uui-button
                    look="primary"
                    color="positive"
                    label="Restore selected"
                    ?disabled=${selectedCount === 0 || this._isRestoring}
                    @click=${this.#openConfirm}>
                    Restore${selectedCount > 0 ? ` ${selectedCount} selected` : ""}
                    ${this._isRestoring
                        ? html`<uui-loader-circle></uui-loader-circle>`
                        : html`<uui-icon name="icon-check"></uui-icon>`}
                </uui-button>
            </div>
        `;
    }

    // ─── Confirm dialog ────────────────────────────────────────────────────────

    #renderConfirmDialog() {
        if (this._view.type !== "detail") return nothing;
        const { version } = this._view;
        const count = this._selectedAliases.size;

        return html`
            <div class="confirm-overlay" @click=${(e: Event) => { if (e.target === e.currentTarget) this._showConfirm = false; }}>
                <uui-dialog>
                    <uui-dialog-layout headline="Confirm Property Restore">
                        <p>
                            You are about to restore <strong>${count} ${count === 1 ? "property" : "properties"}</strong>
                            from the version saved on <strong>${this.#formatDate(version.createDate)}</strong>.
                        </p>
                        <p>How would you like to save the restored values?</p>
                        <uui-button slot="actions" look="secondary" label="Cancel" @click=${() => { this._showConfirm = false; }}>Cancel</uui-button>
                        <uui-button slot="actions" look="outline" label="Save as draft" @click=${() => this.#confirmRestore(false)}>Save as draft</uui-button>
                        <uui-button slot="actions" look="primary" color="positive" label="Save and publish" @click=${() => this.#confirmRestore(true)}>Save &amp; Publish</uui-button>
                    </uui-dialog-layout>
                </uui-dialog>
            </div>
        `;
    }

    // ─── Root render ───────────────────────────────────────────────────────────

    protected override render() {
        const isLoading = this._view.type === "loading" || this._view.type === "comparing";

        const content = (() => {
            switch (this._view.type) {
                case "loading":
                case "comparing":
                    return nothing;
                case "versions":
                    return this.#renderVersionList(this._view.versions);
                case "detail":
                    return this.#renderDetail(this._view.version, this._view.properties);
                case "error":
                    return html`
                        <div class="view-header"><h4 class="view-title">Property Restore</h4></div>
                        <uui-box>
                            <div class="empty-state">
                                <uui-icon name="icon-alert"></uui-icon>
                                <p>${this._view.message}</p>
                                <uui-button look="secondary" label="Try again" @click=${this.#backToVersionList}>Try again</uui-button>
                            </div>
                        </uui-box>
                    `;
            }
        })();

        return html`
            <umb-body-layout>
                ${isLoading ? html`<uui-loader-bar></uui-loader-bar>` : nothing}
                <div class="container">${content}</div>
                ${this._showConfirm ? this.#renderConfirmDialog() : nothing}
            </umb-body-layout>
        `;
    }

    static override styles = css`
        :host { display: block; }

        uui-loader-bar { position: sticky; top: 0; z-index: 10; }

        .container {
            padding: var(--uui-size-layout-1, 24px);
            display: flex;
            flex-direction: column;
            gap: var(--uui-size-layout-1, 24px);
        }

        /* ── View header ── */
        .view-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: var(--uui-size-space-4, 12px);
            flex-wrap: wrap;
        }

        h4.view-title {
            margin: 0 0 var(--uui-size-space-2, 6px);
            font-size: var(--uui-type-large-size, 1.125rem);
            font-weight: 700;
            color: var(--uui-color-text, #1b1b1b);
        }

        .hint {
            margin: 0;
            color: var(--uui-color-text-alt, #6b7280);
            font-size: var(--uui-type-small-size, 0.875rem);
        }

        .comparison-hint {
            margin-bottom: var(--uui-size-space-4, 12px);
        }

        /* ── Culture section (inside box header slot) ── */
        .culture-section {
            display: flex;
            flex-direction: column;
            gap: var(--uui-size-space-2, 6px);
            padding: var(--uui-size-space-3, 9px) 0;
        }

        .culture-row {
            display: flex;
            align-items: center;
            gap: var(--uui-size-space-3, 9px);
        }

        .culture-row uui-input { width: 260px; }

        .culture-error {
            margin: 0;
            color: var(--uui-color-danger-standalone, #d42054);
            font-size: var(--uui-type-small-size, 0.875rem);
        }

        /* ── Version list table ── */
        .row-icon {
            margin-right: var(--uui-size-space-2, 6px);
            vertical-align: middle;
            opacity: 0.5;
        }

        .cell-date { white-space: nowrap; }

        .cell-status {
            display: flex;
            align-items: center;
            gap: var(--uui-size-space-2, 6px);
            flex-wrap: nowrap;
            white-space: nowrap;
        }

        .cell-action { text-align: right; }

        /* ── Comparison table ── */
        .checkbox-cell { width: 48px; }

        .col-property { width: 160px; }

        .col-status {
            width: 120px;
            white-space: nowrap;
        }

        .cell-value { vertical-align: top; }

        uui-table-row.row-changed {
            --uui-table-row-background: color-mix(in srgb, var(--uui-color-danger-standalone, #d42054) 5%, transparent);
        }

        .property-meta {
            display: flex;
            align-items: baseline;
            gap: var(--uui-size-space-2, 6px);
            margin-bottom: var(--uui-size-space-1, 3px);
        }

        .property-meta-label {
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--uui-color-text-alt, #6b7280);
            min-width: 40px;
            flex-shrink: 0;
        }

        .property-name {
            font-weight: 600;
            color: var(--uui-color-text, #1b1b1b);
        }

        .property-alias {
            font-size: var(--uui-type-small-size, 0.875rem);
            color: var(--uui-color-text-alt, #6b7280);
            font-family: var(--uui-font-monospace, monospace);
        }

        pre.value-preview {
            margin: 0;
            font-size: var(--uui-type-small-size, 0.875rem);
            font-family: var(--uui-font-monospace, monospace);
            white-space: pre-wrap;
            word-break: break-word;
            color: var(--uui-color-text, #1b1b1b);
            line-height: 1.5;
        }

        .value-empty {
            color: var(--uui-color-text-alt, #6b7280);
            font-size: var(--uui-type-small-size, 0.875rem);
        }

        /* ── Status pill in comparison hint ── */
        .status-pill {
            margin-right: var(--uui-size-space-3, 9px);
            vertical-align: middle;
        }

        /* ── Diff legend (single block above table) ── */
        .diff-legend-block {
            margin: 0 0 var(--uui-size-space-3, 9px);
            font-size: var(--uui-type-small-size, 0.875rem);
            color: var(--uui-color-text-alt, #6b7280);
        }

        /* ── Diff highlighting ── */
        .diff-removed {
            background: color-mix(in srgb, var(--uui-color-danger-standalone, #d42054) 15%, transparent);
            color: var(--uui-color-danger-standalone, #d42054);
            text-decoration: line-through;
            border-radius: 2px;
            padding: 0 1px;
        }

        .diff-added {
            background: color-mix(in srgb, var(--uui-color-positive-standalone, #0a7557) 15%, transparent);
            color: var(--uui-color-positive-standalone, #0a7557);
            border-radius: 2px;
            padding: 0 1px;
        }

        .diff-legend-added { color: var(--uui-color-positive-standalone, #0a7557); }
        .diff-legend-removed { color: var(--uui-color-danger-standalone, #d42054); }

        /* ── Actions footer ── */
        .detail-header {
            display: flex;
            align-items: center;
            gap: var(--uui-size-space-4, 12px);
        }

        .actions-footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: var(--uui-size-space-4, 12px);
            padding: var(--uui-size-space-3, 9px) 0;
        }

        .selection-count {
            font-size: var(--uui-type-small-size, 0.875rem);
            color: var(--uui-color-text-alt, #6b7280);
            margin-right: auto;
        }

        /* ── Pagination ── */
        .pagination-bar {
            display: flex;
            justify-content: center;
        }

        /* ── Confirm dialog ── */
        .confirm-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .confirm-overlay uui-dialog { max-width: 480px; width: 100%; }

        /* ── Empty / error state ── */
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--uui-size-space-4, 12px);
            padding: var(--uui-size-layout-2, 36px);
            color: var(--uui-color-text-alt, #6b7280);
            text-align: center;
        }

        .empty-state uui-icon { font-size: 2.5rem; opacity: 0.5; }
    `;
}

export default UmbURestoreWorkspaceViewElement;

declare global {
    interface HTMLElementTagNameMap {
        "umb-u-restore-workspace-view": UmbURestoreWorkspaceViewElement;
    }
}
