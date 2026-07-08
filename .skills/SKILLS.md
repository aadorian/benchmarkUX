# SKILL: Nielsen's 10 Usability Heuristics — Review & Violation Highlighter

## Skill name: `nielsen-review`

Invoke with `/nielsen-review` (optionally with a file path or paste code directly).
If code is selected in the editor, Claude will analyse the selection.
If no target is provided, Claude will scan all HTML/CSS/JS files in the project.

---

## How Claude Runs This Skill

1. **Identify the target** — selected code, named file, or full project.
2. **Run through all 10 heuristics in order** (H1–H10).
3. **For each heuristic, report one of three statuses:**
   - ✅ **PASS** — fully satisfied
   - ⚠️ **MINOR** — partially satisfied; gap is noted
   - ❌ **VIOLATION** — rule is broken; exact location + fix is given
4. **Output a Violation Summary** table at the end, sorted by severity.
5. **Score the design** on the 1–5 scale per heuristic; total out of 50.

### Violation Report Format (use for every ❌ / ⚠️)

```
❌ H[N] — [Short violation title]
   Where:  <file>:<line> or <element description>
   Rule:   [The specific rule that is broken]
   Fix:    [Concrete, minimal change to fix it]
```

---

## Heuristic 1 — Visibility of System Status

> Always keep users informed about what is going on, through appropriate feedback within reasonable time.

### Rules
- Every user action must produce visible feedback within 100 ms.
- Long operations (>1 s) must show a loading indicator.
- Form submissions must show a success or error state — never reset silently.
- Active navigation items must be visually distinguished from inactive ones.
- If content is loading asynchronously, show a skeleton or spinner — never a blank area.

### Violation Signals (what to look for)
- `<button>` with no `disabled` toggle and no loading indicator on click handler
- `form.submit()` / `fetch(…).then(…)` with no UI update after resolution
- `<a>` / `<button>` nav items with no `.active`, `aria-current="page"`, or equivalent
- `async` functions that set data without showing a loader first
- Empty `<div>` containers that populate via JS with no placeholder

### Acceptance Criteria
- [ ] Clicking any button produces visible feedback within 100 ms
- [ ] Form submit shows a success message or toast
- [ ] Submit button disables during processing
- [ ] Current page/section is highlighted in navigation
- [ ] No content area is ever blank while data is loading

---

## Heuristic 2 — Match Between System and the Real World

> Speak the users' language. Use words, phrases, and concepts familiar to the user rather than system-oriented terms.

### Rules
- Use domain vocabulary, not technical vocabulary (e.g., "Your Order" not "Transaction ID 8821").
- Icons must be universally understood or paired with a label.
- Date/time formats must match the user's locale.
- Error messages must be in plain language — no stack traces, no HTTP codes exposed to users.
- CTAs must describe the outcome, not the action (e.g., "Find a Pet" not "Submit Query").

### Violation Signals (what to look for)
- Labels like "User ID", "Record", "Entity", "POST", "NULL", "undefined"
- `<img>` / `<svg>` with no `aria-label` and no adjacent text
- `console.error()` or raw `error.message` rendered into the DOM
- Button text: "Submit", "Send", "Execute", "Process", "OK"
- `new Date().toISOString()` displayed directly to users

### Acceptance Criteria
- [ ] No technical jargon visible to end users
- [ ] Every icon has a visible label or descriptive `aria-label`
- [ ] CTAs describe what the user gets, not what the system does
- [ ] Error messages are in plain English with no error codes

---

## Heuristic 3 — User Control and Freedom

> Users often choose functions by mistake. Provide clearly marked "emergency exits."

### Rules
- Every destructive or irreversible action must have an undo or confirmation step.
- Forms must have a visible "Clear" or "Reset" option.
- Modals and overlays must be dismissible via Escape key and a visible close button.
- Navigation must always be accessible — no page should be a dead end.
- On mobile, a hamburger menu or bottom nav must replace hidden desktop nav.

### Violation Signals (what to look for)
- `dialog` / `.modal` with no `keydown Escape` listener and no close `<button>`
- `<form>` with no `type="reset"` button or equivalent clear action
- Delete/remove handlers with no `confirm()` or undo toast
- `@media (max-width: …) { nav { display: none } }` with no mobile replacement
- Links that go to `href="#"` with no meaningful action

### Acceptance Criteria
- [ ] Mobile screens have a working navigation menu (hamburger or bottom bar)
- [ ] All modals close on Escape key
- [ ] Forms have a reset/clear option
- [ ] No anchor link points to bare `#` without a scroll target or action
- [ ] Destructive actions have a confirmation or undo

---

## Heuristic 4 — Consistency and Standards

> Users should not have to wonder whether different words, situations, or actions mean the same thing.

### Rules
- Define and use a single set of design tokens (colors, spacing, radius, typography).
- The same action must always use the same label.
- Button hierarchy must be consistent: primary → secondary → ghost.
- Hover and focus states must be consistent across all interactive elements.
- Page layout sections must follow a predictable pattern.

### Violation Signals (what to look for)
- Hardcoded hex values outside `:root` / a token file
- Same action labelled differently on different pages ("Submit" vs "Send" vs "Apply")
- `:focus` / `:focus-visible` missing from one or more interactive element types
- Inconsistent border-radius, padding, or font-size across similar components
- Primary button used for a low-priority action beside a ghost button for a high-priority one

### Acceptance Criteria
- [ ] All colors reference design tokens — no hardcoded hex values outside `:root`
- [ ] The same CTA action always uses the same label text
- [ ] All interactive elements have visible focus styles
- [ ] Button visual weight matches its importance (primary > secondary > ghost)
- [ ] Card, section, and layout components are visually consistent across the page

---

## Heuristic 5 — Error Prevention

> Design carefully to prevent problems from occurring in the first place.

### Rules
- Constrain inputs to valid values wherever possible (radio cards instead of free-text, date pickers instead of date strings).
- Provide inline format hints via `placeholder` and `pattern`.
- Disable submit until required fields are valid, or validate eagerly on blur.
- Confirm before any irreversible action.
- Use `type="email"`, `type="tel"`, `type="number"` to leverage built-in browser constraints.

### Violation Signals (what to look for)
- `<input type="text">` used for email, phone, or date
- Phone / postcode fields with no `pattern` attribute
- `<select>` with only 2 options (should be radio cards)
- `<textarea>` with no `minlength` / `maxlength`
- Submit handler that doesn't validate before `fetch()`

### Acceptance Criteria
- [ ] Phone fields have a `pattern` attribute
- [ ] Textareas have `minlength` and `maxlength`
- [ ] Binary choices use radio cards, not `<select>` with 2 options
- [ ] `placeholder` text shows expected format for every input
- [ ] No field accepts values that would guarantee a server error

---

## Heuristic 6 — Recognition Rather Than Recall

> Minimize the user's memory load. Make objects, actions, and options visible.

### Rules
- All form labels must be persistently visible — never label-as-placeholder-only.
- Navigation must be visible at all times (sticky header or always-accessible bottom bar).
- Show all available filter/sort options simultaneously — never hide them behind a click.
- Show content previews (cards, thumbnails) so users can recognise what they want.
- Required fields must be visually marked (asterisk + legend).

### Violation Signals (what to look for)
- `<input placeholder="Name">` with no `<label>` — placeholder is the only label
- `position: sticky` / `position: fixed` absent from the main navigation
- Filter options inside a `<details>` / dropdown that require a click to reveal
- List of items that shows only names with no image, summary, or preview
- `required` fields with no visual indicator (no `*`, no colour, no legend)

### Acceptance Criteria
- [ ] All form labels are always visible (not replaced by placeholders)
- [ ] Required fields are marked with `*` and a legend
- [ ] Filter/sort options are all visible without an extra click
- [ ] Navigation is sticky or always accessible
- [ ] Content is shown as visual cards/previews, not just a list of names

---

## Heuristic 7 — Flexibility and Efficiency of Use

> Allow users to tailor frequent actions. Accelerators speed up interaction for experts.

### Rules
- Provide anchor links so users can jump directly to any section.
- CTAs within content must deep-link to the relevant action.
- Support full keyboard navigation for all interactive elements.
- Filtering and sorting should update results without a page reload.
- Consider a "back to top" button for long pages.

### Violation Signals (what to look for)
- Sections with no `id` attribute and no corresponding anchor in the nav
- `a[href^="#"]` without smooth-scroll behaviour
- Filter buttons that reload the page or call `location.reload()`
- `<div onclick="…">` used instead of `<button>` (not keyboard-accessible)
- Long pages (>3 screens) with no back-to-top affordance

### Acceptance Criteria
- [ ] All major sections have `id` anchors and matching nav links
- [ ] Anchor links use smooth scroll
- [ ] Filters update content without page reload
- [ ] All interactive elements are reachable via Tab key
- [ ] A "back to top" affordance exists on pages longer than 3 screens

---

## Heuristic 8 — Aesthetic and Minimalist Design

> Avoid irrelevant or rarely needed information. Every extra unit of information competes with relevant information.

### Rules
- Each section must have a single, clear purpose.
- Decorative animations must respect `prefers-reduced-motion`.
- Background effects must not interfere with text legibility.
- Use whitespace deliberately — generous padding increases perceived quality.
- Limit the color palette to 1 primary accent, 1 secondary, and 2–3 neutrals.

### Violation Signals (what to look for)
- `@keyframes` / `animation:` with no `@media (prefers-reduced-motion: reduce)` override
- Decorative `<div>` / `<canvas>` elements that lack `aria-hidden="true"`
- Text rendered over a busy background image without a contrast overlay
- More than 3 distinct accent colors across the page
- Sections with two unrelated content blocks merged together

### Acceptance Criteria
- [ ] All animations are disabled when `prefers-reduced-motion: reduce` is set
- [ ] Decorative elements use `aria-hidden="true"` and `pointer-events: none`
- [ ] No more than 2 accent colors are used
- [ ] Background effects do not reduce text contrast below WCAG AA (4.5:1)
- [ ] Each section has one clear visual focal point

---

## Heuristic 9 — Help Users Recognize, Diagnose, and Recover from Errors

> Error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution.

### Rules
- Never rely on browser-native validation bubbles alone — always add custom inline error messages.
- Error messages must appear adjacent to the field that caused them.
- Fields with errors must have a visible error state (red border + icon) AND an ARIA-linked message.
- Error messages must say what went wrong AND how to fix it.
- On form-level errors, move focus to the first invalid field.

### Violation Signals (what to look for)
- `input.reportValidity()` or browser bubbles as the only error feedback
- Generic messages: "Invalid input", "Error", "Something went wrong"
- Error text not linked via `aria-describedby` to its field
- `aria-invalid` attribute never set on invalid fields
- `form.submit()` that doesn't move focus to the first failing field

### Acceptance Criteria
- [ ] No reliance on browser-native validation bubbles
- [ ] Every field has a corresponding `<span id="[field]-error">` element
- [ ] Error messages are in plain English and say how to fix the problem
- [ ] Invalid fields have `aria-invalid="true"` and a linked `aria-describedby`
- [ ] Focus moves to the first invalid field on submit
- [ ] Errors clear on correction (validate on input/change after first submit)

---

## Heuristic 10 — Help and Documentation

> Even if the system can be used without documentation, it may be necessary to provide help.

### Rules
- Provide persistent helper text for fields that have non-obvious expectations.
- The "How it Works" or process section must appear before the conversion action.
- Include a visible support contact (email or phone as `mailto:` / `tel:` links).
- Use trust signals near conversion points (privacy notice, response time, commitment level).
- Post-submission, tell the user exactly what happens next.

### Violation Signals (what to look for)
- Fields with ambiguous expectations and only a placeholder for guidance
- Contact links that are plain text (`support@…`) not `<a href="mailto:…">`
- Adoption / checkout form with no "How it works" section visible above it
- CTA with no adjacent trust signal (privacy note, no-commitment statement, timeline)
- Thank-you / success state that gives no next-step information

### Acceptance Criteria
- [ ] Every non-obvious field has a persistent hint below it (not just a placeholder)
- [ ] "How it Works" section appears before the adoption form
- [ ] Trust signals are displayed adjacent to the primary CTA
- [ ] Support email and phone are real `mailto:` and `tel:` links
- [ ] Post-submission message tells the user exactly what happens next
- [ ] Privacy statement is visible near the form submit button

---

## Scoring Rubric

Score each heuristic 1–5 after the review:

| Score | Meaning |
|---|---|
| 5 | Fully satisfied — no gaps |
| 4 | Satisfied with minor gaps |
| 3 | Partially satisfied |
| 2 | Significant violations present |
| 1 | Severely violates this heuristic |

| Total | Assessment |
|---|---|
| 45–50 | Excellent — ready for production |
| 35–44 | Good — fix gaps before launch |
| 25–34 | Fair — significant rework needed |
| < 25  | Poor — redesign required |

---

## Violation Summary Table (output at end of every review)

Claude must output this table at the end, sorted by severity (❌ first, then ⚠️):

| Severity | Heuristic | Violation | File / Element | Fix |
|---|---|---|---|---|
| ❌ | H[N] — [name] | [what's broken] | [file:line or element] | [minimal fix] |
| ⚠️ | H[N] — [name] | [gap] | [file:line or element] | [suggestion] |

---

## Quick Reference Checklist

```
H1 — Visibility of System Status
[ ] Button shows spinner/disabled state during processing
[ ] Form shows success or error after submit
[ ] Active nav item is visually distinguished
[ ] No blank loading areas

H2 — Match Between System and the Real World
[ ] No technical jargon visible to users
[ ] All icons have labels or aria-labels
[ ] CTAs describe outcome not action

H3 — User Control and Freedom
[ ] Mobile nav is accessible (hamburger or bottom bar)
[ ] Modals close on Escape
[ ] Form has reset option
[ ] No dead-end pages or bare # links

H4 — Consistency and Standards
[ ] All colors from design tokens
[ ] Same action = same label throughout
[ ] All interactive elements have focus styles
[ ] Button hierarchy is consistent

H5 — Error Prevention
[ ] Phone has pattern attribute
[ ] Textarea has minlength/maxlength
[ ] Binary choices use radio cards not <select>
[ ] Placeholders show expected format

H6 — Recognition Rather Than Recall
[ ] All form labels persistently visible
[ ] Required fields marked with * and legend
[ ] Filter options always visible
[ ] Navigation always accessible

H7 — Flexibility and Efficiency of Use
[ ] Anchor links on all sections
[ ] Smooth scroll enabled
[ ] Filters work without page reload
[ ] Back-to-top button present
[ ] All interactions keyboard-accessible

H8 — Aesthetic and Minimalist Design
[ ] prefers-reduced-motion respected
[ ] Decorative elements aria-hidden + pointer-events:none
[ ] Max 2 accent colors
[ ] Text contrast >= 4.5:1 (WCAG AA)

H9 — Help Users Recognize, Diagnose, and Recover from Errors
[ ] No browser-native validation bubbles
[ ] Inline error per field with aria-invalid + aria-describedby
[ ] Errors say what went wrong AND how to fix it
[ ] Focus moves to first invalid field on submit

H10 — Help and Documentation
[ ] Persistent hints below non-obvious fields
[ ] How it Works before the form
[ ] Trust signals near CTA
[ ] Support contacts are mailto:/tel: links
[ ] Post-submit message explains next steps
```
