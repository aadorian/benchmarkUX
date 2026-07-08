# Changelog

All notable changes to **Nielsen Heuristics — Usability Violation Highlighter** are documented here.

This project adheres to [Semantic Versioning](https://semver.org/).

---

## [0.1.0] — 2026-07-07

### Added

**31 static-analysis checks across all 10 Nielsen heuristics:**

- **H1 Visibility of System Status** — submit button without loading state, form without success/error feedback, nav without active state
- **H2 Match Between System and the Real World** — `<img>` missing `alt`, `<svg>` without `aria-label`/`aria-hidden`, CTA using system-action text, label with technical jargon
- **H3 User Control and Freedom** — bare `href="#"` links, modal without Escape dismissal, form without reset option
- **H4 Consistency and Standards** — hardcoded hex in `style` attribute, hardcoded hex in CSS outside `:root`, `:focus` without `:focus-visible`
- **H5 Error Prevention** — phone input without `pattern`, textarea without `minlength`/`maxlength`, email field as `type="text"`, `<select>` with 2 options
- **H6 Recognition Rather Than Recall** — placeholder-only label (no `<label>`), `<section>` without `id`, required fields without visual marker
- **H7 Flexibility and Efficiency** — `<div onclick>` (not keyboard-accessible), anchor links without smooth-scroll, filter triggering full page reload
- **H8 Aesthetic and Minimalist Design** — animation without `prefers-reduced-motion` override, decorative element without `aria-hidden`
- **H9 Help Users Recognize, Diagnose, and Recover from Errors** — required field without `aria-describedby`, form with no `aria-invalid`, generic error text
- **H10 Help and Documentation** — plain-text email (no `mailto:`), plain-text phone (no `tel:`), textarea without hint text

**Editor integration:**
- Inline squiggly underlines (Error / Warning / Info) via the VSCode Diagnostics API
- Problems panel entries with click-to-navigate support
- Scored report panel (score out of 50) with violations grouped by heuristic
- Concrete fix hint for every violation
- Right-click context menu entries for HTML / CSS / JS files
- `Cmd+Shift+U` keyboard shortcut for full-file review
- `Cmd+Shift+Alt+U` keyboard shortcut for selection-only review
- `nielsen.reviewOnSave` setting (default: off)
- `nielsen.showReportPanel` setting (default: on)
- Auto-clear diagnostics when a file is closed
