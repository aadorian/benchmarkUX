# Nielsen Heuristics — Usability Violation Highlighter

A Visual Studio Code extension that detects and highlights usability violations in HTML, CSS, and JavaScript files based on **Nielsen's 10 Usability Heuristics**. Run a review to get inline squiggly underlines, Problems panel entries, and a scored report panel — all without leaving your editor.

---

## Requirements

- Visual Studio Code **1.74.0** or later
- Files must be `.html`, `.css`, or `.js` (the extension activates automatically for these language IDs)
- No build step, no dependencies — plain JavaScript, works out of the box

---

## Installation

### Option A — Install from folder (development / local use)

1. Copy the `nielsen-heuristics-vscode/` folder into your VSCode extensions directory:

   **macOS / Linux**
   ```
   ~/.vscode/extensions/nielsen-heuristics-0.1.0/
   ```

   **Windows**
   ```
   %USERPROFILE%\.vscode\extensions\nielsen-heuristics-0.1.0\
   ```

2. Restart VSCode (or run **Developer: Reload Window** from the Command Palette).

### Option B — Install from VSIX

If you have packaged the extension as a `.vsix` file:

1. Open VSCode.
2. Press `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Windows/Linux).
3. Run **Extensions: Install from VSIX…**
4. Select the `.vsix` file.

To package the extension yourself, install `vsce` and run:

```bash
npm install -g @vscode/vsce
cd nielsen-heuristics-vscode
vsce package
```

---

## How to use

### Run a review

| Method | Action |
|---|---|
| **Keyboard** | `Cmd+Shift+U` (Mac) / `Ctrl+Shift+U` (Win/Linux) with the editor focused |
| **Command Palette** | `Cmd+Shift+P` → **Nielsen: Review File for Usability Violations** |
| **Right-click menu** | Right-click anywhere in the file → **Nielsen: Review File for Usability Violations** |

### Review a selection only

Highlight the code you want to check, then:

| Method | Action |
|---|---|
| **Keyboard** | `Cmd+Shift+Alt+U` (Mac) / `Ctrl+Shift+Alt+U` (Win/Linux) |
| **Command Palette** | `Cmd+Shift+P` → **Nielsen: Review Selected Code** |
| **Right-click menu** | Select text → right-click → **Nielsen: Review Selected Code** |

### See violations in the editor

After running a review, violations appear as **squiggly underlines** directly in your code:

- **Red underline** — Error (blocks accessibility or causes a hard usability failure)
- **Yellow underline** — Warning (significant gap that should be fixed before launch)
- **Blue underline** — Info (improvement opportunity)

Hover over any underline to see the **violation message** and the **recommended fix**.

### Problems panel

Open the Problems panel (`Cmd+Shift+M` / `Ctrl+Shift+M`) to see all violations as a list. Each entry shows:

- The heuristic source (e.g. `Nielsen H1`, `Nielsen H5`)
- The violation message
- The file and line number — click to jump directly to the offending code

### Report panel

After every review, a **Nielsen Report** panel opens beside your file showing:

- A **score out of 50** (5 points per heuristic) with an overall assessment
- A **score grid** with individual scores per heuristic (H1–H10), colour-coded green → red
- All violations **grouped by heuristic**, each with:
  - Severity icon (✖ error / ⚠ warning / ℹ info)
  - The check label and line number
  - The full violation message
  - A concrete **Fix** suggestion

To reopen the report panel at any time:

```
Cmd+Shift+P → Nielsen: Show Report Panel
```

### Clear diagnostics

```
Cmd+Shift+P → Nielsen: Clear All Diagnostics
```

---

## Settings

Open `Settings` (`Cmd+,`) and search for **Nielsen** to find these options:

| Setting | Default | Description |
|---|---|---|
| `nielsen.reviewOnSave` | `false` | Run the review automatically every time you save a `.html`, `.css`, or `.js` file |
| `nielsen.showReportPanel` | `true` | Open the report panel automatically after each review |

To set them in `settings.json`:

```json
{
  "nielsen.reviewOnSave": true,
  "nielsen.showReportPanel": true
}
```

---

## What gets checked

The extension runs **31 checks** across all 10 heuristics. Every check reports the violation location, a plain-language message, and a concrete fix.

---

### H1 — Visibility of System Status

| Check | Severity |
|---|---|
| Submit button without loading/disabled state | Warning |
| Form with no visible success/error feedback pattern | Warning |
| Navigation with no active/current state | Info |

> Every user action must produce visible feedback. Long operations must show a loading indicator. Form submissions must show a success or error state.

---

### H2 — Match Between System and the Real World

| Check | Severity |
|---|---|
| `<img>` missing `alt` attribute | Error |
| `<svg>` without `aria-label` or `aria-hidden` | Warning |
| CTA button using system-action text ("Submit", "Execute") | Info |
| Form label containing technical jargon (ID, UUID, Entity…) | Warning |

> Use words, phrases, and concepts familiar to users. Icons must have labels. CTAs must describe what the user gets, not what the system does.

---

### H3 — User Control and Freedom

| Check | Severity |
|---|---|
| `href="#"` — dead-end link with no target | Warning |
| Modal/dialog without Escape-key dismissal | Warning |
| Form without a clear/reset option | Info |

> Provide clearly marked emergency exits. Every destructive or modal action needs an undo or a way out.

---

### H4 — Consistency and Standards

| Check | Severity |
|---|---|
| Hardcoded colour value in a `style` attribute | Warning |
| Hardcoded hex colour outside `:root` in CSS | Info |
| CSS uses `:focus` but not `:focus-visible` | Warning |

> Use design tokens. The same action must always look and behave the same. All interactive elements need consistent focus styles.

---

### H5 — Error Prevention

| Check | Severity |
|---|---|
| Phone `<input>` without a `pattern` attribute | Warning |
| `<textarea>` without `minlength`/`maxlength` | Warning |
| Email field using `type="text"` instead of `type="email"` | Error |
| `<select>` with exactly 2 options (should be radio cards) | Info |

> Constrain inputs to valid values before the user can submit. Prevent errors at the source.

---

### H6 — Recognition Rather Than Recall

| Check | Severity |
|---|---|
| Input field using placeholder as its only label | Error |
| `<section>` without an `id` (cannot be nav-anchored) | Info |
| Required fields with no visual asterisk or legend | Info |

> Make all options, labels, and navigation permanently visible. Never hide information that the user needs to recall from memory.

---

### H7 — Flexibility and Efficiency of Use

| Check | Severity |
|---|---|
| `<div onclick>` — not keyboard-accessible | Error |
| Anchor links without smooth-scroll behaviour | Info |
| Filter/sort triggers a full page reload | Warning |

> Support keyboard navigation. Allow users to jump directly to sections. Filters should update in-place without a page reload.

---

### H8 — Aesthetic and Minimalist Design

| Check | Severity |
|---|---|
| Animation without `@media (prefers-reduced-motion: reduce)` override | Warning |
| Decorative element without `aria-hidden="true"` | Warning |

> Every animation must be suppressible. Decorative visuals must be hidden from assistive technology. Less is more.

---

### H9 — Help Users Recognize, Diagnose, and Recover from Errors

| Check | Severity |
|---|---|
| Required field without `aria-describedby` (no error wiring) | Warning |
| Form with no `aria-invalid` usage | Warning |
| Generic error message text ("Something went wrong", "Error") | Warning |

> Error messages must say what went wrong and how to fix it. Invalid fields must be announced to screen readers via `aria-invalid`.

---

### H10 — Help and Documentation

| Check | Severity |
|---|---|
| Email address not wrapped in a `mailto:` link | Warning |
| Phone number not wrapped in a `tel:` link | Warning |
| `<textarea>` without persistent hint text (`aria-describedby`) | Info |

> Support contacts must be clickable. Non-obvious fields need persistent helper text. Users should never need to guess.

---

## Scoring

After each review, the report panel shows a **score out of 50** (5 points per heuristic):

| Score | Assessment |
|---|---|
| 45–50 | Excellent — ready for production |
| 35–44 | Good — fix gaps before launch |
| 25–34 | Fair — significant rework needed |
| < 25 | Poor — redesign required |

Per-heuristic scores:

| Score | Meaning |
|---|---|
| 5/5 | No violations found |
| 4/5 | Info-level gaps only |
| 3/5 | Warnings present |
| 2/5 | Errors present |

---

## Supported file types

| Language | Activated |
|---|---|
| HTML | Yes |
| CSS | Yes |
| JavaScript | Yes |
| TypeScript / JSX / other | No (can be added by editing `activationEvents` in `package.json`) |

---

## Commands reference

| Command | Keyboard shortcut | Description |
|---|---|---|
| `Nielsen: Review File for Usability Violations` | `Cmd+Shift+U` | Review the entire active file |
| `Nielsen: Review Selected Code` | `Cmd+Shift+Alt+U` | Review only the highlighted selection |
| `Nielsen: Show Report Panel` | — | Reopen the scored report panel |
| `Nielsen: Clear All Diagnostics` | — | Remove all squiggly underlines and clear the Problems panel |

All commands are also available in the right-click context menu when editing an HTML, CSS, or JavaScript file.

---

## Project structure

```
nielsen-heuristics-vscode/
├── package.json     Extension manifest (commands, keybindings, settings)
├── extension.js     All analysis logic, diagnostics, and report webview
└── README.md        This file
```

---

## Reference

- [Nielsen's 10 Usability Heuristics — Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [WCAG 2.1 Success Criteria](https://www.w3.org/TR/WCAG21/)
- [VS Code Extension API — Diagnostics](https://code.visualstudio.com/api/language-extensions/programmatic-language-features#provide-diagnostics)
