import { LitElement as ye, nothing as v, html as c, css as _e, state as _, customElement as xe } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as Ce } from "@umbraco-cms/backoffice/element-api";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as ke } from "@umbraco-cms/backoffice/document";
import { UMB_AUTH_CONTEXT as $e } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as Pe } from "@umbraco-cms/backoffice/notification";
class ne {
  diff(e, t, s = {}) {
    let n;
    typeof s == "function" ? (n = s, s = {}) : "callback" in s && (n = s.callback);
    const a = this.castInput(e, s), r = this.castInput(t, s), h = this.removeEmpty(this.tokenize(a, s)), u = this.removeEmpty(this.tokenize(r, s));
    return this.diffWithOptionsObj(h, u, s, n);
  }
  diffWithOptionsObj(e, t, s, n) {
    var a;
    const r = (p) => {
      if (p = this.postProcess(p, s), n) {
        setTimeout(function() {
          n(p);
        }, 0);
        return;
      } else
        return p;
    }, h = t.length, u = e.length;
    let d = 1, f = h + u;
    s.maxEditLength != null && (f = Math.min(f, s.maxEditLength));
    const k = (a = s.timeout) !== null && a !== void 0 ? a : 1 / 0, $ = Date.now() + k, g = [{ oldPos: -1, lastComponent: void 0 }];
    let x = this.extractCommon(g[0], t, e, 0, s);
    if (g[0].oldPos + 1 >= u && x + 1 >= h)
      return r(this.buildValues(g[0].lastComponent, t, e));
    let R = -1 / 0, L = 1 / 0;
    const Y = () => {
      for (let p = Math.max(R, -d); p <= Math.min(L, d); p += 2) {
        let C;
        const P = g[p - 1], z = g[p + 1];
        P && (g[p - 1] = void 0);
        let N = !1;
        if (z) {
          const K = z.oldPos - p;
          N = z && 0 <= K && K < h;
        }
        const Q = P && P.oldPos + 1 < u;
        if (!N && !Q) {
          g[p] = void 0;
          continue;
        }
        if (!Q || N && P.oldPos < z.oldPos ? C = this.addToPath(z, !0, !1, 0, s) : C = this.addToPath(P, !1, !0, 1, s), x = this.extractCommon(C, t, e, p, s), C.oldPos + 1 >= u && x + 1 >= h)
          return r(this.buildValues(C.lastComponent, t, e)) || !0;
        g[p] = C, C.oldPos + 1 >= u && (L = Math.min(L, p - 1)), x + 1 >= h && (R = Math.max(R, p + 1));
      }
      d++;
    };
    if (n)
      (function p() {
        setTimeout(function() {
          if (d > f || Date.now() > $)
            return n(void 0);
          Y() || p();
        }, 0);
      })();
    else
      for (; d <= f && Date.now() <= $; ) {
        const p = Y();
        if (p)
          return p;
      }
  }
  addToPath(e, t, s, n, a) {
    const r = e.lastComponent;
    return r && !a.oneChangePerToken && r.added === t && r.removed === s ? {
      oldPos: e.oldPos + n,
      lastComponent: { count: r.count + 1, added: t, removed: s, previousComponent: r.previousComponent }
    } : {
      oldPos: e.oldPos + n,
      lastComponent: { count: 1, added: t, removed: s, previousComponent: r }
    };
  }
  extractCommon(e, t, s, n, a) {
    const r = t.length, h = s.length;
    let u = e.oldPos, d = u - n, f = 0;
    for (; d + 1 < r && u + 1 < h && this.equals(s[u + 1], t[d + 1], a); )
      d++, u++, f++, a.oneChangePerToken && (e.lastComponent = { count: 1, previousComponent: e.lastComponent, added: !1, removed: !1 });
    return f && !a.oneChangePerToken && (e.lastComponent = { count: f, previousComponent: e.lastComponent, added: !1, removed: !1 }), e.oldPos = u, d;
  }
  equals(e, t, s) {
    return s.comparator ? s.comparator(e, t) : e === t || !!s.ignoreCase && e.toLowerCase() === t.toLowerCase();
  }
  removeEmpty(e) {
    const t = [];
    for (let s = 0; s < e.length; s++)
      e[s] && t.push(e[s]);
    return t;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  castInput(e, t) {
    return e;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tokenize(e, t) {
    return Array.from(e);
  }
  join(e) {
    return e.join("");
  }
  postProcess(e, t) {
    return e;
  }
  get useLongestToken() {
    return !1;
  }
  buildValues(e, t, s) {
    const n = [];
    let a;
    for (; e; )
      n.push(e), a = e.previousComponent, delete e.previousComponent, e = a;
    n.reverse();
    const r = n.length;
    let h = 0, u = 0, d = 0;
    for (; h < r; h++) {
      const f = n[h];
      if (f.removed)
        f.value = this.join(s.slice(d, d + f.count)), d += f.count;
      else {
        if (!f.added && this.useLongestToken) {
          let k = t.slice(u, u + f.count);
          k = k.map(function($, g) {
            const x = s[d + g];
            return x.length > $.length ? x : $;
          }), f.value = this.join(k);
        } else
          f.value = this.join(t.slice(u, u + f.count));
        u += f.count, f.added || (d += f.count);
      }
    }
    return n;
  }
}
function ee(i, e) {
  let t;
  for (t = 0; t < i.length && t < e.length; t++)
    if (i[t] != e[t])
      return i.slice(0, t);
  return i.slice(0, t);
}
function te(i, e) {
  let t;
  if (!i || !e || i[i.length - 1] != e[e.length - 1])
    return "";
  for (t = 0; t < i.length && t < e.length; t++)
    if (i[i.length - (t + 1)] != e[e.length - (t + 1)])
      return i.slice(-t);
  return i.slice(-t);
}
function j(i, e, t) {
  if (i.slice(0, e.length) != e)
    throw Error(`string ${JSON.stringify(i)} doesn't start with prefix ${JSON.stringify(e)}; this is a bug`);
  return t + i.slice(e.length);
}
function M(i, e, t) {
  if (!e)
    return i + t;
  if (i.slice(-e.length) != e)
    throw Error(`string ${JSON.stringify(i)} doesn't end with suffix ${JSON.stringify(e)}; this is a bug`);
  return i.slice(0, -e.length) + t;
}
function S(i, e) {
  return j(i, e, "");
}
function D(i, e) {
  return M(i, e, "");
}
function ie(i, e) {
  return e.slice(0, ze(i, e));
}
function ze(i, e) {
  let t = 0;
  i.length > e.length && (t = i.length - e.length);
  let s = e.length;
  i.length < e.length && (s = i.length);
  const n = Array(s);
  let a = 0;
  n[0] = 0;
  for (let r = 1; r < s; r++) {
    for (e[r] == e[a] ? n[r] = n[a] : n[r] = a; a > 0 && e[r] != e[a]; )
      a = n[a];
    e[r] == e[a] && a++;
  }
  a = 0;
  for (let r = t; r < i.length; r++) {
    for (; a > 0 && i[r] != e[a]; )
      a = n[a];
    i[r] == e[a] && a++;
  }
  return a;
}
function A(i) {
  let e;
  for (e = i.length - 1; e >= 0 && i[e].match(/\s/); e--)
    ;
  return i.substring(e + 1);
}
function w(i) {
  const e = i.match(/^\s*/);
  return e ? e[0] : "";
}
const se = "a-zA-Z0-9_\\u{AD}\\u{C0}-\\u{D6}\\u{D8}-\\u{F6}\\u{F8}-\\u{2C6}\\u{2C8}-\\u{2D7}\\u{2DE}-\\u{2FF}\\u{1E00}-\\u{1EFF}", Se = new RegExp(`[${se}]+|\\s+|[^${se}]`, "ug");
class Ae extends ne {
  equals(e, t, s) {
    return s.ignoreCase && (e = e.toLowerCase(), t = t.toLowerCase()), e.trim() === t.trim();
  }
  tokenize(e, t = {}) {
    let s;
    if (t.intlSegmenter) {
      const r = t.intlSegmenter;
      if (r.resolvedOptions().granularity != "word")
        throw new Error('The segmenter passed must have a granularity of "word"');
      s = [];
      for (const h of Array.from(r.segment(e))) {
        const u = h.segment;
        s.length && /\s/.test(s[s.length - 1]) && /\s/.test(u) ? s[s.length - 1] += u : s.push(u);
      }
    } else
      s = e.match(Se) || [];
    const n = [];
    let a = null;
    return s.forEach((r) => {
      /\s/.test(r) ? a == null ? n.push(r) : n.push(n.pop() + r) : a != null && /\s/.test(a) ? n[n.length - 1] == a ? n.push(n.pop() + r) : n.push(a + r) : n.push(r), a = r;
    }), n;
  }
  join(e) {
    return e.map((t, s) => s == 0 ? t : t.replace(/^\s+/, "")).join("");
  }
  postProcess(e, t) {
    if (!e || t.oneChangePerToken)
      return e;
    let s = null, n = null, a = null;
    return e.forEach((r) => {
      r.added ? n = r : r.removed ? a = r : ((n || a) && ae(s, a, n, r), s = r, n = null, a = null);
    }), (n || a) && ae(s, a, n, null), e;
  }
}
const Ee = new Ae();
function De(i, e, t) {
  return Ee.diff(i, e, t);
}
function ae(i, e, t, s) {
  if (e && t) {
    const n = w(e.value), a = A(e.value), r = w(t.value), h = A(t.value);
    if (i) {
      const u = ee(n, r);
      i.value = M(i.value, r, u), e.value = S(e.value, u), t.value = S(t.value, u);
    }
    if (s) {
      const u = te(a, h);
      s.value = j(s.value, h, u), e.value = D(e.value, u), t.value = D(t.value, u);
    }
  } else if (t) {
    if (i) {
      const n = w(t.value);
      t.value = t.value.substring(n.length);
    }
    if (s) {
      const n = w(s.value);
      s.value = s.value.substring(n.length);
    }
  } else if (i && s) {
    const n = w(s.value), a = w(e.value), r = A(e.value), h = ee(n, a);
    e.value = S(e.value, h);
    const u = te(S(n, h), r);
    e.value = D(e.value, u), s.value = j(s.value, n, u), i.value = M(i.value, n, n.slice(0, n.length - u.length));
  } else if (s) {
    const n = w(s.value), a = A(e.value), r = ie(a, n);
    e.value = D(e.value, r);
  } else if (i) {
    const n = A(i.value), a = w(e.value), r = ie(n, a);
    e.value = S(e.value, r);
  }
}
class Ie extends ne {
  constructor() {
    super(...arguments), this.tokenize = Oe;
  }
  equals(e, t, s) {
    return s.ignoreWhitespace ? ((!s.newlineIsToken || !e.includes(`
`)) && (e = e.trim()), (!s.newlineIsToken || !t.includes(`
`)) && (t = t.trim())) : s.ignoreNewlineAtEof && !s.newlineIsToken && (e.endsWith(`
`) && (e = e.slice(0, -1)), t.endsWith(`
`) && (t = t.slice(0, -1))), super.equals(e, t, s);
  }
}
const Ve = new Ie();
function We(i, e, t) {
  return Ve.diff(i, e, t);
}
function Oe(i, e) {
  e.stripTrailingCr && (i = i.replace(/\r\n/g, `
`));
  const t = [], s = i.split(/(\n|\r\n)/);
  s[s.length - 1] || s.pop();
  for (let n = 0; n < s.length; n++) {
    const a = s[n];
    n % 2 && !e.newlineIsToken ? t[t.length - 1] += a : t.push(a);
  }
  return t;
}
const re = "/umbraco/umbracommunityurestore/api/v1", oe = "/umbraco/management/api/v1";
async function W(i) {
  return {
    Authorization: `Bearer ${i}`,
    "Content-Type": "application/json"
  };
}
async function Te(i, e, t, s = 0, n = 10) {
  const a = new URL(`${oe}/document-version`, window.location.origin);
  a.searchParams.set("documentId", i), t && a.searchParams.set("culture", t), a.searchParams.set("skip", String(s)), a.searchParams.set("take", String(n));
  const r = await fetch(a.toString(), { headers: await W(e) });
  if (!r.ok) {
    const d = await r.text().catch(() => "");
    throw new Error(`Versions API returned ${r.status}: ${d}`);
  }
  const h = await r.json(), u = (h.items ?? []).map((d) => ({
    versionId: d.id,
    createDate: d.versionDate,
    isCurrentDraft: d.isCurrentDraftVersion ?? !1,
    isCurrentPublished: d.isCurrentPublishedVersion ?? !1,
    preventCleanup: d.preventCleanup ?? !1
  }));
  return { versions: u, total: h.total ?? u.length };
}
async function Re(i, e, t, s) {
  const n = new URL(
    `${re}/content/${i}/version/${e}/properties`,
    window.location.origin
  );
  s && n.searchParams.set("culture", s);
  const a = await fetch(n.toString(), { headers: await W(t) });
  if (!a.ok) {
    const r = await a.text().catch(() => "");
    throw new Error(`Properties API returned ${a.status}: ${r}`);
  }
  return a.json();
}
async function Le(i, e, t) {
  const s = await fetch(`${re}/content/${i}/restore`, {
    method: "POST",
    headers: await W(t),
    body: JSON.stringify(e)
  });
  return s.ok ? { ok: !0 } : { ok: !1, error: await s.text().catch(() => "Unknown error") };
}
async function Ne(i, e) {
  const t = await fetch(`${oe}/document/${i}/publish`, {
    method: "PUT",
    headers: await W(e),
    body: JSON.stringify({ publishSchedules: [] })
  });
  return t.ok ? { ok: !0 } : { ok: !1, error: await t.text().catch(() => "Unknown error") };
}
var Ue = Object.defineProperty, je = Object.getOwnPropertyDescriptor, le = (i) => {
  throw TypeError(i);
}, b = (i, e, t, s) => {
  for (var n = s > 1 ? void 0 : s ? je(e, t) : e, a = i.length - 1, r; a >= 0; a--)
    (r = i[a]) && (n = (s ? r(e, t, n) : r(n)) || n);
  return s && n && Ue(e, t, n), n;
}, ue = (i, e, t) => e.has(i) || le("Cannot " + t), U = (i, e, t) => (ue(i, e, "read from private field"), t ? t.call(i) : e.get(i)), Me = (i, e, t) => e.has(i) ? le("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(i) : e.set(i, t), l = (i, e, t) => (ue(i, e, "access private method"), t), o, I, ce, O, y, he, T, H, de, F, X, B, fe, pe, J, E, me, V, q, Z, ve, ge, be, we;
const G = 10;
let m = class extends Ce(ye) {
  constructor() {
    super(...arguments), Me(this, o), this._view = { type: "loading" }, this._contentId = "", this._selectedAliases = /* @__PURE__ */ new Set(), this._isRestoring = !1, this._showConfirm = !1, this._totalVersions = 0, this._currentPage = 1, this._culture = "", this._cachedVersions = null;
  }
  connectedCallback() {
    super.connectedCallback(), l(this, o, ce).call(this);
  }
  // ─── Root render ───────────────────────────────────────────────────────────
  render() {
    const i = this._view.type === "loading" || this._view.type === "comparing", e = (() => {
      switch (this._view.type) {
        case "loading":
        case "comparing":
          return v;
        case "versions":
          return l(this, o, ge).call(this, this._view.versions);
        case "detail":
          return l(this, o, be).call(this, this._view.version, this._view.properties);
        case "error":
          return c`
                        <div class="detail-header">
                            <uui-button look="primary" label="Back" @click=${l(this, o, T)}>
                                <uui-icon name="icon-arrow-left"></uui-icon>
                                Back
                            </uui-button>
                        </div>
                        <uui-box>
                            <div class="empty-state">
                                <uui-icon name="icon-alert"></uui-icon>
                                <p class="error-headline">Something went wrong</p>
                                <p class="error-detail">${l(this, o, me).call(this, this._view.message)}</p>
                                ${this._culture ? c`
                                    <uui-button look="primary" label="Clear filter" @click=${l(this, o, X)}>
                                        Clear filter
                                    </uui-button>` : v}
                            </div>
                        </uui-box>
                    `;
      }
    })();
    return c`
            <umb-body-layout>
                ${i ? c`<uui-loader-bar></uui-loader-bar>` : v}
                <div class="container">${e}</div>
                ${this._showConfirm ? l(this, o, we).call(this) : v}
            </umb-body-layout>
        `;
  }
};
o = /* @__PURE__ */ new WeakSet();
I = function() {
  return this._culture === "" || l(this, o, H).call(this, this._culture) ? "" : "Enter a valid culture code (e.g. en-US, fr-FR) or leave blank for invariant.";
};
ce = function() {
  this.consumeContext($e, (i) => {
    this._authContext = i;
  }), this.consumeContext(Pe, (i) => {
    this._notificationContext = i;
  }), this.consumeContext(ke, (i) => {
    i && (this._workspaceCtx = i, this.observe(i.unique, async (e) => {
      e && e !== this._contentId && (this._contentId = e, await l(this, o, y).call(this, 1));
    }));
  });
};
O = async function() {
  var e;
  const i = (e = this._authContext) == null ? void 0 : e.getOpenApiConfiguration();
  if (!(i != null && i.token)) return "";
  if (typeof i.token == "function") {
    const t = i.token();
    return (t instanceof Promise ? await t : t) ?? "";
  }
  return i.token;
};
y = async function(i = this._currentPage) {
  this._currentPage = i, this._view = { type: "loading" };
  try {
    const e = await l(this, o, O).call(this), t = (i - 1) * G, { versions: s, total: n } = await Te(
      this._contentId,
      e,
      this._culture || void 0,
      t,
      G
    );
    this._totalVersions = n, s.length > 0 && (this._cachedVersions = s), this._view = { type: "versions", versions: s };
  } catch (e) {
    this._view = { type: "error", message: e instanceof Error ? e.message : "Failed to load version history." };
  }
};
he = async function(i) {
  this._view = { type: "comparing" }, this._selectedAliases = /* @__PURE__ */ new Set();
  try {
    const e = await l(this, o, O).call(this), t = await Re(
      this._contentId,
      i.versionId,
      e,
      this._culture || void 0
    );
    this._selectedAliases = new Set(t.filter((s) => s.hasChanges).map((s) => s.alias)), this._view = { type: "detail", version: i, properties: t };
  } catch (e) {
    this._view = { type: "error", message: e instanceof Error ? e.message : "Failed to load property comparison." };
  }
};
T = function() {
  this._cachedVersions ? this._view = { type: "versions", versions: this._cachedVersions } : l(this, o, y).call(this, this._currentPage);
};
H = function(i) {
  return i === "" || /^[a-zA-Z]{2,8}(-[a-zA-Z0-9]{2,8})*$/.test(i);
};
de = function(i) {
  this._culture = i;
};
F = function() {
  l(this, o, H).call(this, this._culture) && l(this, o, y).call(this, 1);
};
X = function() {
  this._culture = "", l(this, o, y).call(this, 1);
};
B = function(i) {
  const e = new Set(this._selectedAliases);
  e.has(i) ? e.delete(i) : e.add(i), this._selectedAliases = e;
};
fe = function(i) {
  if (this._view.type !== "detail") return;
  const e = i.target.checked;
  this._selectedAliases = e ? new Set(this._view.properties.map((t) => t.alias)) : /* @__PURE__ */ new Set();
};
pe = function() {
  this._view.type !== "detail" || this._selectedAliases.size === 0 || (this._showConfirm = !0);
};
J = async function(i) {
  var t, s, n, a;
  if (this._showConfirm = !1, this._view.type !== "detail") return;
  const { version: e } = this._view;
  this._isRestoring = !0;
  try {
    const r = await l(this, o, O).call(this), h = await Le(this._contentId, {
      versionId: e.versionId,
      propertyAliases: Array.from(this._selectedAliases),
      culture: this._culture || null
    }, r);
    if (!h.ok) {
      (t = this._notificationContext) == null || t.peek("danger", { data: { headline: "Restore failed", message: h.error ?? "An unexpected error occurred." } });
      return;
    }
    if (i) {
      const u = await Ne(this._contentId, r);
      (s = this._notificationContext) == null || s.peek(u.ok ? "positive" : "warning", {
        data: u.ok ? { headline: "Restored and published", message: `${this._selectedAliases.size} ${this._selectedAliases.size === 1 ? "property" : "properties"} restored and published.` } : { headline: "Restored but not published", message: u.error ?? "Draft saved but could not be published." }
      });
    } else
      (n = this._notificationContext) == null || n.peek("positive", { data: { headline: "Properties restored", message: `${this._selectedAliases.size} ${this._selectedAliases.size === 1 ? "property" : "properties"} restored as a draft.` } });
    await Promise.all([
      l(this, o, y).call(this, 1),
      (a = this._workspaceCtx) == null ? void 0 : a.load(this._contentId)
    ]);
  } finally {
    this._isRestoring = !1;
  }
};
E = function(i) {
  return new Intl.DateTimeFormat(void 0, { dateStyle: "medium", timeStyle: "short" }).format(new Date(i));
};
me = function(i) {
  const e = i.match(/\{[\s\S]*\}/);
  if (e)
    try {
      const t = JSON.parse(e[0]);
      if (t.title) return t.title;
    } catch {
    }
  return i;
};
V = function(i) {
  if (!i) return "";
  try {
    return JSON.stringify(JSON.parse(i), null, 2);
  } catch {
    return i;
  }
};
q = function(i) {
  if (!i) return !1;
  try {
    return JSON.parse(i), !0;
  } catch {
    return !1;
  }
};
Z = function(i) {
  return i ? c`<pre class="value-preview">${l(this, o, V).call(this, i)}</pre>` : c`<em class="value-empty">empty</em>`;
};
ve = function(i, e) {
  if (!i && !e) return c`<em class="value-empty">empty</em>`;
  const t = l(this, o, V).call(this, i), s = l(this, o, V).call(this, e), n = l(this, o, q).call(this, i) || l(this, o, q).call(this, e) ? We(s, t) : De(s, t);
  return c`
            <pre class="value-preview diff-preview">${n.map(
    (a) => a.removed ? c`<span class="diff-removed">${a.value}</span>` : a.added ? c`<span class="diff-added">${a.value}</span>` : a.value
  )}</pre>
        `;
};
ge = function(i) {
  const e = Math.ceil(this._totalVersions / G);
  return i.length === 0 ? c`
                <div class="detail-header">
                    <uui-button look="primary" label="Back" @click=${l(this, o, T)}>
                        <uui-icon name="icon-arrow-left"></uui-icon>
                        Back
                    </uui-button>
                </div>
                <uui-box>
                    <div class="empty-state">
                        <uui-icon name="icon-history"></uui-icon>
                        ${this._culture ? c`
                                <p>No saved versions found for culture <strong>${this._culture}</strong>.</p>
                                <uui-button look="primary" label="Clear filter" @click=${l(this, o, X)}>
                                    Clear filter
                                </uui-button>` : c`<p>No saved versions found for this content.</p>`}
                    </div>
                </uui-box>
            ` : c`
            <div class="view-header">
                <div>
                    <h4 class="view-title">Property Restore</h4>
                    <p class="hint">Select a version to compare its properties against the current draft, then choose which values to restore.</p>
                </div>
                <uui-button look="primary" label="Refresh" @click=${() => l(this, o, y).call(this, 1)}>
                    <uui-icon name="icon-refresh"></uui-icon>
                    Refresh
                </uui-button>
            </div>

            <div class="culture-section">
                <uui-label for="culture-input">Culture</uui-label>
                <div class="culture-input-row">
                    <uui-input
                        id="culture-input"
                        placeholder="e.g. en-US (leave blank for invariant)"
                        .value=${this._culture}
                        ?error=${!!U(this, o, I)}
                        @input=${(t) => l(this, o, de).call(this, t.target.value)}
                        @keydown=${(t) => {
    t.key === "Enter" && l(this, o, F).call(this);
  }}>
                    </uui-input>
                    <uui-button look="primary" label="Search" @click=${l(this, o, F)}>Search</uui-button>
                </div>
                ${U(this, o, I) ? c`<p class="culture-error">${U(this, o, I)}</p>` : c`<p class="hint">
                        For multilingual sites, enter a culture code to filter versions by language.
                        Leave blank for invariant (non-language-specific) values.
                    </p>`}
            </div>

            <uui-box>
                <uui-table>
                    <uui-table-head>
                        <uui-table-head-cell>Version</uui-table-head-cell>
                        <uui-table-head-cell>Status</uui-table-head-cell>
                        <uui-table-head-cell></uui-table-head-cell>
                    </uui-table-head>

                    ${i.map((t) => c`
                        <uui-table-row>
                            <uui-table-cell class="cell-date">
                                <uui-icon name="icon-history" class="row-icon"></uui-icon>
                                ${l(this, o, E).call(this, t.createDate)}
                            </uui-table-cell>
                            <uui-table-cell class="cell-status">
                                ${t.isCurrentDraft ? c`<uui-tag color="warning" look="primary" size="s">Current draft</uui-tag>` : v}
                                ${t.isCurrentPublished ? c`<uui-tag color="positive" look="primary" size="s">Published</uui-tag>` : v}
                                ${!t.isCurrentDraft && !t.isCurrentPublished ? c`<uui-tag look="outline" size="s">Saved</uui-tag>` : v}
                                ${t.preventCleanup ? c`<uui-tag look="outline" size="s">Pinned</uui-tag>` : v}
                            </uui-table-cell>
                            <uui-table-cell class="cell-action">
                                <uui-button
                                    look="secondary"
                                    label="Compare with current draft"
                                    ?disabled=${t.isCurrentDraft}
                                    @click=${() => l(this, o, he).call(this, t)}>
                                    Compare
                                </uui-button>
                            </uui-table-cell>
                        </uui-table-row>
                    `)}
                </uui-table>
            </uui-box>

            ${e > 1 ? c`
                <div class="pagination-bar">
                    <uui-pagination
                        .total=${e}
                        .current=${this._currentPage}
                        @change=${(t) => l(this, o, y).call(this, t.target.current)}>
                    </uui-pagination>
                </div>
            ` : v}
        `;
};
be = function(i, e) {
  const t = this._selectedAliases.size, s = t === e.length, n = e.filter((a) => a.hasChanges).length;
  return c`
            <div class="detail-header">
                <uui-button look="primary" label="Back" @click=${l(this, o, T)}>
                    <uui-icon name="icon-arrow-left"></uui-icon>
                    Back
                </uui-button>
            </div>

            <uui-box>
                <div slot="headline">
                    Property Restore &mdash; Version from ${l(this, o, E).call(this, i.createDate)}
                </div>

                <p class="hint comparison-hint">
                    ${i.isCurrentDraft ? c`<uui-tag color="warning" look="primary" size="s" class="status-pill">Current draft</uui-tag>` : i.isCurrentPublished ? c`<uui-tag color="positive" look="primary" size="s" class="status-pill">Published</uui-tag>` : c`<uui-tag look="outline" size="s" class="status-pill">Saved</uui-tag>`}
                    ${n > 0 ? c`<strong>${n} ${n === 1 ? "property differs" : "properties differ"}</strong>
                               from the current draft and ${n === 1 ? "has been" : "have been"} pre-selected.
                               Deselect any you do not want to restore.` : "This version is identical to the current draft. You can still select properties to overwrite."}
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
                                .checked=${s}
                                .indeterminate=${t > 0 && !s}
                                @change=${l(this, o, fe)}>
                            </uui-checkbox>
                        </uui-table-head-cell>
                        <uui-table-head-cell class="col-property">Property</uui-table-head-cell>
                        <uui-table-head-cell class="col-status">Status</uui-table-head-cell>
                        <uui-table-head-cell>Current draft value</uui-table-head-cell>
                        <uui-table-head-cell>Value in this version (${l(this, o, E).call(this, i.createDate)})</uui-table-head-cell>
                    </uui-table-head>

                    ${e.map((a) => c`
                        <uui-table-row
                            class="${a.hasChanges ? "row-changed" : ""}"
                            selectable
                            ?selected=${this._selectedAliases.has(a.alias)}
                            @click=${() => l(this, o, B).call(this, a.alias)}>

                            <uui-table-cell class="checkbox-cell" @click=${(r) => r.stopPropagation()}>
                                <uui-checkbox
                                    label="Select ${a.label}"
                                    .checked=${this._selectedAliases.has(a.alias)}
                                    @change=${() => l(this, o, B).call(this, a.alias)}>
                                </uui-checkbox>
                            </uui-table-cell>

                            <uui-table-cell class="col-property cell-value">
                                <div class="property-meta">
                                    <span class="property-meta-label">Name</span>
                                    <span class="property-name">${a.label}</span>
                                </div>
                                <div class="property-meta">
                                    <span class="property-meta-label">Alias</span>
                                    <span class="property-alias">${a.alias}</span>
                                </div>
                                <div class="property-meta">
                                    <span class="property-meta-label">Editor</span>
                                    <span class="property-alias">${a.editorAlias}</span>
                                </div>
                            </uui-table-cell>

                            <uui-table-cell class="col-status cell-status">
                                ${a.hasChanges ? c`<uui-tag color="danger" look="primary" size="s">Changed</uui-tag>` : c`<uui-tag look="outline" size="s">Unchanged</uui-tag>`}
                            </uui-table-cell>

                            <uui-table-cell class="cell-value">
                                ${l(this, o, Z).call(this, a.currentValue)}
                            </uui-table-cell>

                            <uui-table-cell class="cell-value">
                                ${a.hasChanges ? l(this, o, ve).call(this, a.historicalValue, a.currentValue) : l(this, o, Z).call(this, a.historicalValue)}
                            </uui-table-cell>
                        </uui-table-row>
                    `)}
                </uui-table>
            </uui-box>

            <div class="actions-footer">
                <span class="selection-count">
                    ${t === 0 ? "No properties selected" : `${t} ${t === 1 ? "property" : "properties"} selected`}
                </span>
                ${t > 0 && !this._isRestoring ? c`
                    <uui-button
                        look="primary"
                        label="Restore selected"
                        @click=${l(this, o, pe)}>
                        Restore ${t} ${t === 1 ? "property" : "properties"}
                    </uui-button>` : v}
            </div>
        `;
};
we = function() {
  if (this._view.type !== "detail") return v;
  const { version: i } = this._view, e = this._selectedAliases.size;
  return c`
            <div class="confirm-overlay" @click=${(t) => {
    t.target === t.currentTarget && (this._showConfirm = !1);
  }}>
                <uui-dialog>
                    <uui-dialog-layout headline="Confirm Property Restore">
                        <p>
                            You are about to restore <strong>${e} ${e === 1 ? "property" : "properties"}</strong>
                            from the version saved on <strong>${l(this, o, E).call(this, i.createDate)}</strong>.
                        </p>
                        <p>How would you like to save the restored values?</p>
                        <uui-button slot="actions" look="secondary" label="Cancel" @click=${() => {
    this._showConfirm = !1;
  }}>Cancel</uui-button>
                        <uui-button slot="actions" look="outline" label="Save as draft" @click=${() => l(this, o, J).call(this, !1)}>Save as draft</uui-button>
                        <uui-button slot="actions" look="primary" color="positive" label="Save and publish" @click=${() => l(this, o, J).call(this, !0)}>Save &amp; Publish</uui-button>
                    </uui-dialog-layout>
                </uui-dialog>
            </div>
        `;
};
m.styles = _e`
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

        /* ── Culture section ── */
        .culture-section {
            display: flex;
            flex-direction: column;
            gap: var(--uui-size-space-2, 6px);
        }

        .culture-input-row {
            display: flex;
            align-items: center;
            gap: var(--uui-size-space-3, 9px);
        }

        .culture-input-row uui-input { width: 260px; }

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

        .error-headline {
            margin: 0;
            font-weight: 600;
            color: var(--uui-color-text, #1b1b1b);
        }

        .error-detail {
            margin: 0;
            font-size: var(--uui-type-small-size, 0.875rem);
            color: var(--uui-color-text-alt, #6b7280);
            max-width: 480px;
        }
    `;
b([
  _()
], m.prototype, "_view", 2);
b([
  _()
], m.prototype, "_contentId", 2);
b([
  _()
], m.prototype, "_selectedAliases", 2);
b([
  _()
], m.prototype, "_isRestoring", 2);
b([
  _()
], m.prototype, "_showConfirm", 2);
b([
  _()
], m.prototype, "_totalVersions", 2);
b([
  _()
], m.prototype, "_currentPage", 2);
b([
  _()
], m.prototype, "_culture", 2);
m = b([
  xe("umb-u-restore-workspace-view")
], m);
const Ge = m;
export {
  m as UmbURestoreWorkspaceViewElement,
  Ge as default
};
//# sourceMappingURL=workspace-view.element-Byi4Lb_j.js.map
