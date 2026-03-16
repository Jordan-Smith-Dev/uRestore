const API_BASE = "/umbraco/umbracommunityurestore/api/v1";
const MGMT_BASE = "/umbraco/management/api/v1";

export type ContentVersionModel = {
    versionId: string;
    createDate: string;
    isCurrentDraft: boolean;
    isCurrentPublished: boolean;
    preventCleanup: boolean;
};

export type PropertyComparisonModel = {
    alias: string;
    label: string;
    editorAlias: string;
    currentValue: string | null;
    historicalValue: string | null;
    hasChanges: boolean;
    culture: string | null;
    segment: string | null;
};

export type PropertyRestoreRequest = {
    versionId: string;
    propertyAliases: string[];
    culture: string | null;
};

async function getHeaders(token: string): Promise<HeadersInit> {
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

export async function getVersions(
    contentId: string,
    token: string,
    culture?: string,
    skip = 0,
    take = 10
): Promise<{ versions: ContentVersionModel[]; total: number }> {
    const url = new URL(`${MGMT_BASE}/document-version`, window.location.origin);
    url.searchParams.set("documentId", contentId);
    if (culture) url.searchParams.set("culture", culture);
    url.searchParams.set("skip", String(skip));
    url.searchParams.set("take", String(take));

    const response = await fetch(url.toString(), { headers: await getHeaders(token) });
    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Versions API returned ${response.status}: ${text}`);
    }

    const data = await response.json() as { items?: any[]; total?: number };
    const versions = (data.items ?? []).map((item: any): ContentVersionModel => ({
        versionId: item.id,
        createDate: item.versionDate,
        isCurrentDraft: item.isCurrentDraftVersion ?? false,
        isCurrentPublished: item.isCurrentPublishedVersion ?? false,
        preventCleanup: item.preventCleanup ?? false,
    }));
    return { versions, total: data.total ?? versions.length };
}

export async function getVersionProperties(
    contentId: string,
    versionId: string,
    token: string,
    culture?: string
): Promise<PropertyComparisonModel[]> {
    const url = new URL(
        `${API_BASE}/content/${contentId}/version/${versionId}/properties`,
        window.location.origin
    );
    if (culture) url.searchParams.set("culture", culture);

    const response = await fetch(url.toString(), { headers: await getHeaders(token) });
    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Properties API returned ${response.status}: ${text}`);
    }
    return response.json() as Promise<PropertyComparisonModel[]>;
}

export async function restoreProperties(
    contentId: string,
    request: PropertyRestoreRequest,
    token: string
): Promise<{ ok: boolean; error?: string }> {
    const response = await fetch(`${API_BASE}/content/${contentId}/restore`, {
        method: "POST",
        headers: await getHeaders(token),
        body: JSON.stringify(request),
    });

    if (response.ok) return { ok: true };
    const text = await response.text().catch(() => "Unknown error");
    return { ok: false, error: text };
}

export async function publishContent(
    contentId: string,
    token: string
): Promise<{ ok: boolean; error?: string }> {
    const response = await fetch(`${MGMT_BASE}/document/${contentId}/publish`, {
        method: "PUT",
        headers: await getHeaders(token),
        body: JSON.stringify({ publishSchedules: [] }),
    });

    if (response.ok) return { ok: true };
    const text = await response.text().catch(() => "Unknown error");
    return { ok: false, error: text };
}
