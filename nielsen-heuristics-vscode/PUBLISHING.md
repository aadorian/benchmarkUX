# Publishing to the VS Code Marketplace

Step-by-step guide to publish **Nielsen Heuristics** as a public extension on the
[Visual Studio Code Marketplace](https://marketplace.visualstudio.com/).

---

## Prerequisites

| Tool | Install |
|---|---|
| Node.js 18+ | https://nodejs.org |
| `@vscode/vsce` | `npm install -g @vscode/vsce` |
| Azure DevOps account | https://dev.azure.com (free, used to generate the PAT) |

---

## Step 1 — Create a publisher account

1. Go to https://marketplace.visualstudio.com/manage
2. Sign in with your Microsoft / Azure account.
3. Click **Create publisher**.
4. Set the **Publisher ID** to exactly `findapaw` (must match the `publisher` field in `package.json`).
5. Fill in a display name and save.

> **Note:** The Publisher ID is permanent and must be lowercase, no spaces.

---

## Step 2 — Get a Personal Access Token (PAT)

1. Open https://dev.azure.com and sign in with the same account.
2. Click your profile avatar (top-right) → **Personal access tokens**.
3. Click **New Token**.
4. Set:
   - **Name:** `vsce-publish`
   - **Organization:** `All accessible organizations`
   - **Expiration:** 90 days (or longer)
   - **Scopes:** Select **Custom defined** → tick **Marketplace → Manage**
5. Click **Create** and **copy the token immediately** — it is shown only once.

---

## Step 3 — Log in with vsce

```bash
vsce login findapaw
```

Paste your PAT when prompted. Your credentials are stored in the system keychain.

---

## Step 4 — Generate the icon

The `icon.png` must be present before packaging. Run:

```bash
node generate-icon.js
```

This tries `rsvg-convert`, `inkscape`, and `magick` in order.
If none are installed it falls back to a built-in Node.js renderer — no dependencies needed.

To use a custom icon instead, replace `icon.png` with any 128×128 PNG.

---

## Step 5 — Package the extension

```bash
vsce package
```

This produces `nielsen-heuristics-0.1.0.vsix`. Check the output list to confirm only the right files are included (controlled by `.vscodeignore`).

**Expected output:**
```
Files included in the VSIX:
nielsen-heuristics-0.1.0.vsix
├─ [Content_Types].xml
├─ extension.vsixmanifest
└─ extension/
   ├─ LICENSE.txt
   ├─ changelog.md
   ├─ extension.js
   ├─ icon.png
   ├─ package.json
   └─ readme.md
```

---

## Step 6 — Publish

```bash
vsce publish
```

`vsce` packages and uploads in one step.
The extension goes live on the marketplace within a few minutes.

### Publish a specific version bump

```bash
vsce publish patch   # 0.1.0 → 0.1.1
vsce publish minor   # 0.1.0 → 0.2.0
vsce publish major   # 0.1.0 → 1.0.0
```

---

## Step 7 — Verify on the marketplace

1. Go to https://marketplace.visualstudio.com/items?itemName=findapaw.nielsen-heuristics
2. Confirm the listing shows the correct name, icon, description, README, and CHANGELOG.
3. Install it from the marketplace page and run `Nielsen: Review File` in VSCode to smoke-test.

---

## Updating the extension

1. Edit `extension.js` with your changes.
2. Update `CHANGELOG.md` — add a new `## [x.x.x] — YYYY-MM-DD` section.
3. Run:

```bash
vsce publish patch   # (or minor/major depending on the change)
```

---

## Installing locally (without publishing)

To install the `.vsix` directly into VSCode for testing:

```bash
code --install-extension nielsen-heuristics-0.1.0.vsix
```

Or via the UI: `Cmd+Shift+P` → **Extensions: Install from VSIX…** → select the file.

---

## Unpublishing / taking down

```bash
vsce unpublish findapaw.nielsen-heuristics
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Error: Missing publisher name` | Ensure `"publisher": "findapaw"` is in `package.json` |
| `401 Unauthorized` | Run `vsce login findapaw` again with a fresh PAT |
| `icon.png not found` | Run `node generate-icon.js` first |
| `README.md has no content` | The marketplace requires at least one non-empty line in README |
| `vsce: command not found` | Run `npm install -g @vscode/vsce` |
| PAT expired | Generate a new PAT at https://dev.azure.com and run `vsce login` again |

---

## File checklist before publishing

```
nielsen-heuristics-vscode/
├── package.json       ← publisher, version, keywords, repository all set
├── extension.js       ← main extension logic
├── README.md          ← shown on the marketplace listing page
├── CHANGELOG.md       ← shown on the marketplace changelog tab
├── LICENSE            ← MIT license
├── icon.png           ← 128×128 PNG (run generate-icon.js if missing)
└── .vscodeignore      ← excludes icon.svg, generate-icon.js, PUBLISHING.md
```
