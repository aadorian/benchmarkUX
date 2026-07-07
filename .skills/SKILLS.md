# SKILL: Generate Best UX/UI According to Nielsen's 10 Heuristics

Use this document as a checklist and prompt guide when designing or generating any web interface.
For each heuristic, follow the mandatory rules, apply the implementation patterns, and verify against the acceptance criteria before shipping.

---

## How to Use This Skill

When generating or reviewing a UI, run through all 10 heuristics in order.
For each one, ask: **"Does this interface satisfy this principle? If not, what is the minimum change that fixes it?"**

Score each heuristic 1–5:
- **5** — Fully satisfied, no gaps
- **4** — Satisfied with minor gaps
- **3** — Partially satisfied
- **2** — Significant violations present
- **1** — Severely violates this heuristic

A total score below 35/50 signals the design needs revision before handoff.

---

## Heuristic 1 — Visibility of System Status

> Always keep users informed about what is going on, through appropriate feedback within reasonable time.

### Rules
- Every user action must produce visible feedback within 100ms.
- Long operations (>1s) must show a loading indicator.
- Form submissions must show a success or error state — never reset silently.
- Active navigation items must be visually distinguished from inactive ones.
- If content is loading asynchronously, show a skeleton or spinner — never a blank area.

### Implementation Patterns
```html
<!-- Button loading state -->
<button id="submitBtn" type="submit">
  <span class="btn-label">Submit</span>
  <span class="btn-spinner" hidden aria-hidden="true">…</span>
</button>

<!-- On submit -->
submitBtn.disabled = true;
submitBtn.querySelector('.btn-label').hidden = true;
submitBtn.querySelector('.btn-spinner').hidden = false;
```

```css
/* Active nav link */
nav a[aria-current="page"] {
  color: var(--accent);
  border-bottom: 2px solid var(--accent);
}

/* Skeleton loader */
.skeleton {
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
```

### Acceptance Criteria
- [ ] Clicking any button produces visible feedback within 100ms
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
- Error messages must be written in plain language — no stack traces, no HTTP codes exposed to users.
- CTAs must describe the outcome, not the action (e.g., "Find a Pet" not "Submit Query").

### Implementation Patterns
```html
<!-- Bad: technical label -->
<label for="tel">User Contact String</label>

<!-- Good: natural language -->
<label for="tel">Phone Number</label>

<!-- Outcome-oriented CTA -->
<button type="submit">Find My Perfect Pet →</button>

<!-- Icon always paired with text -->
<button aria-label="Save to favourites">
  <svg aria-hidden="true">…heart icon…</svg>
  Save
</button>
```

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

### Implementation Patterns
```html
<!-- Mobile hamburger menu -->
<button id="menuToggle" aria-expanded="false" aria-controls="mobileNav" aria-label="Open menu">
  <svg aria-hidden="true">…hamburger icon…</svg>
</button>
<nav id="mobileNav" hidden>…links…</nav>

<script>
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    mobileNav.hidden = open;
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { mobileNav.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); }
  });
</script>

<!-- Undo toast -->
<div role="status" aria-live="polite" class="toast">
  Application submitted. <button onclick="undoSubmit()">Undo</button>
</div>

<!-- Form reset -->
<button type="reset">Clear Form</button>
```

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
- The same action must always use the same label (e.g., never mix "Submit" and "Send" for the same action).
- Button hierarchy must be consistent: primary → secondary → ghost, in that order of visual weight.
- Hover and focus states must be consistent across all interactive elements.
- Page layout sections must follow a predictable pattern.

### Implementation Patterns
```css
/* Design token system — define once, use everywhere */
:root {
  --color-primary: #D2603A;
  --color-primary-dark: #B14A28;
  --color-text: #2B1810;
  --color-text-muted: #6B5444;
  --color-bg: #FAF3E3;
  --color-border: #E8D9B8;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;

  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 32px;
  --space-xl: 64px;

  --font-body: 'Plus Jakarta Sans', sans-serif;
  --font-display: 'Fraunces', serif;
}

/* Consistent button hierarchy */
.btn-primary   { background: var(--color-primary); color: white; }
.btn-secondary { background: transparent; border: 2px solid var(--color-primary); color: var(--color-primary); }
.btn-ghost     { background: transparent; color: var(--color-primary); text-decoration: underline; }

/* Consistent focus ring — apply to ALL interactive elements */
:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}
```

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
- Disable submit until required fields are valid (or validate eagerly on blur).
- Confirm before any irreversible action (delete, submit final form).
- Use `type="email"`, `type="tel"`, `type="number"` etc. to leverage built-in browser constraints.

### Implementation Patterns
```html
<!-- Phone with pattern -->
<input
  type="tel"
  id="phone"
  name="phone"
  pattern="[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}"
  placeholder="(555) 234-5678"
  aria-describedby="phone-hint"
  required
>
<span id="phone-hint" class="field-hint">Format: (555) 234-5678</span>

<!-- Textarea with min length -->
<textarea
  id="message"
  minlength="30"
  maxlength="1000"
  required
  aria-describedby="message-hint"
></textarea>
<span id="message-hint" class="field-hint">Minimum 30 characters</span>

<!-- Visual radio cards instead of <select> for binary choices -->
<fieldset>
  <legend>Home Type</legend>
  <label class="radio-card">
    <input type="radio" name="homeType" value="house" required class="sr-only">
    <span class="radio-card__body">
      <svg aria-hidden="true">…house icon…</svg>
      House
    </span>
  </label>
  <label class="radio-card">
    <input type="radio" name="homeType" value="apartment" class="sr-only">
    <span class="radio-card__body">
      <svg aria-hidden="true">…building icon…</svg>
      Apartment
    </span>
  </label>
</fieldset>
```

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
- Show content previews (pet cards, thumbnails) so users can recognise what they want.
- Required fields must be visually marked (asterisk + legend).

### Implementation Patterns
```html
<!-- Persistent label — NEVER use placeholder as the only label -->
<div class="field">
  <label for="fullName">
    Full Name <span aria-label="required" class="required-mark">*</span>
  </label>
  <input type="text" id="fullName" name="fullName" placeholder="Jamie Rivera" required>
</div>

<!-- Always-visible filter tabs -->
<div role="group" aria-label="Filter pets by type">
  <button class="filter-btn active" data-filter="all" aria-pressed="true">All Pets</button>
  <button class="filter-btn" data-filter="dog" aria-pressed="false">Dogs</button>
  <button class="filter-btn" data-filter="cat" aria-pressed="false">Cats</button>
</div>

<!-- Required field legend -->
<p class="form-legend"><span aria-hidden="true">*</span> Required fields</p>
```

```css
/* Sticky navigation */
header {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
  background: rgba(255,255,255,0.85);
}
```

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
- CTAs within content (e.g., "Adopt" on a pet card) must deep-link to the relevant action.
- Support keyboard navigation for all interactive elements.
- Filtering and sorting should update results without a page reload.
- Consider a "back to top" button for long pages.

### Implementation Patterns
```html
<!-- Section anchor IDs -->
<section id="pets">…</section>
<section id="adopt">…</section>

<!-- Nav with anchor links + smooth scroll -->
<nav>
  <a href="#pets">Browse Pets</a>
  <a href="#how">How it Works</a>
  <a href="#adopt">Adopt</a>
</nav>

<!-- Back to top -->
<button id="backToTop" aria-label="Back to top" hidden>↑ Top</button>

<script>
  /* Smooth scroll */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* Back to top visibility */
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => { backToTop.hidden = window.scrollY < 400; });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* Filter without reload */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      renderPets(btn.dataset.filter);
    });
  });
</script>
```

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
- Each section must have a single, clear purpose — no section tries to do two things.
- Decorative animations must respect `prefers-reduced-motion`.
- Background effects (particles, gradients, textures) must not interfere with text legibility.
- Use whitespace deliberately — generous padding increases perceived quality and reduces cognitive load.
- Limit the color palette to 1 primary accent, 1 secondary, and 2–3 neutrals.

### Implementation Patterns
```css
/* Always respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Minimal color palette */
:root {
  --color-accent: #D2603A;      /* one primary accent */
  --color-secondary: #3D5A3D;   /* one secondary */
  --color-text: #2B1810;        /* body text */
  --color-text-muted: #6B5444;  /* secondary text */
  --color-bg: #FAF3E3;          /* page background */
}

/* Generous whitespace */
section { padding: 80px 24px; }
.card   { padding: 32px; }
.field  { margin-bottom: 24px; }
```

```html
<!-- Decorative element: aria-hidden + pointer-events none -->
<div class="bg-animation" aria-hidden="true" style="pointer-events:none"></div>
```

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
- Never use browser-native validation bubbles alone — always add custom inline error messages.
- Error messages must appear adjacent to the field that caused them.
- Fields with errors must have a visible error state (red border + icon) AND an ARIA-linked message.
- Error messages must say what went wrong AND how to fix it.
- On form-level errors, move focus to the first invalid field.

### Implementation Patterns
```html
<!-- Field with error state -->
<div class="field" id="field-email">
  <label for="email">Email Address <span aria-label="required">*</span></label>
  <input
    type="email"
    id="email"
    name="email"
    aria-describedby="email-error"
    aria-invalid="true"
    class="input input--error"
    required
  >
  <span id="email-error" class="field-error" role="alert">
    Please enter a valid email address (e.g. jamie@example.com).
  </span>
</div>
```

```css
.input--error {
  border-color: #DC2626;
  background: #FEF2F2;
}
.field-error {
  color: #DC2626;
  font-size: 0.875rem;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.field-error::before {
  content: '⚠';
  aria-hidden: true;
}
```

```js
function validateForm(form) {
  let firstInvalid = null;
  form.querySelectorAll('[required]').forEach(field => {
    const error = document.getElementById(field.id + '-error');
    if (!field.validity.valid) {
      field.setAttribute('aria-invalid', 'true');
      field.classList.add('input--error');
      if (error) error.hidden = false;
      if (!firstInvalid) firstInvalid = field;
    } else {
      field.setAttribute('aria-invalid', 'false');
      field.classList.remove('input--error');
      if (error) error.hidden = true;
    }
  });
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  if (validateForm(form)) submitForm();
});

// Validate on blur for early inline feedback
form.querySelectorAll('[required]').forEach(field => {
  field.addEventListener('blur', () => validateField(field));
});
```

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

### Implementation Patterns
```html
<!-- Persistent field hint (not placeholder) -->
<div class="field">
  <label for="message">Why do you want to adopt? <span aria-label="required">*</span></label>
  <textarea id="message" name="message" aria-describedby="message-hint" minlength="30" required></textarea>
  <span id="message-hint" class="field-hint">
    Be specific — mention your home, lifestyle, and experience with pets. Minimum 30 characters.
  </span>
</div>

<!-- Trust signals near CTA -->
<aside class="trust-signals">
  <div class="trust-item">
    <svg aria-hidden="true">…shield icon…</svg>
    <div>
      <strong>No commitment</strong>
      <p>Applying doesn't obligate you to adopt.</p>
    </div>
  </div>
  <div class="trust-item">
    <svg aria-hidden="true">…clock icon…</svg>
    <div>
      <strong>24-hour response</strong>
      <p>A real person will contact you within a day.</p>
    </div>
  </div>
</aside>

<!-- Post-submission next steps -->
<div class="success-message" role="status" aria-live="polite">
  <h3>Application received!</h3>
  <p>We'll review your application and email you at <strong id="confirmedEmail"></strong> within 24 hours with next steps.</p>
</div>

<!-- Support contact as links -->
<a href="mailto:hello@findapaw.com">hello@findapaw.com</a>
<a href="tel:+18007294663">1-800-PAW-HOME</a>
```

### Acceptance Criteria
- [ ] Every non-obvious field has a persistent hint below it (not just a placeholder)
- [ ] "How it Works" section appears before the adoption form
- [ ] Trust signals are displayed adjacent to the primary CTA
- [ ] Support email and phone are real `mailto:` and `tel:` links
- [ ] Post-submission message tells the user exactly what happens next
- [ ] Privacy statement is visible near the form submit button

---

## Full Checklist (Quick Reference)

Copy this into your review before shipping any UI:

```
Heuristic 1 — Visibility of System Status
[ ] Button shows spinner/disabled state during processing
[ ] Form shows success or error after submit
[ ] Active nav item is visually distinguished
[ ] No blank loading areas

Heuristic 2 — Match Between System and the Real World
[ ] No technical jargon visible to users
[ ] All icons have labels or aria-labels
[ ] CTAs describe outcome not action

Heuristic 3 — User Control and Freedom
[ ] Mobile nav is accessible (hamburger or bottom bar)
[ ] Modals close on Escape
[ ] Form has reset option
[ ] No dead-end pages or bare # links

Heuristic 4 — Consistency and Standards
[ ] All colors from design tokens
[ ] Same action = same label throughout
[ ] All interactive elements have focus styles
[ ] Button hierarchy is consistent

Heuristic 5 — Error Prevention
[ ] Phone has pattern attribute
[ ] Textarea has minlength/maxlength
[ ] Binary choices use radio cards not <select>
[ ] Placeholders show expected format

Heuristic 6 — Recognition Rather Than Recall
[ ] All form labels persistently visible
[ ] Required fields marked with * and legend
[ ] Filter options always visible
[ ] Navigation always accessible

Heuristic 7 — Flexibility and Efficiency of Use
[ ] Anchor links on all sections
[ ] Smooth scroll enabled
[ ] Filters work without page reload
[ ] Back-to-top button present
[ ] All interactions keyboard-accessible

Heuristic 8 — Aesthetic and Minimalist Design
[ ] prefers-reduced-motion respected
[ ] Decorative elements aria-hidden + pointer-events:none
[ ] Max 2 accent colors
[ ] Text contrast ≥ 4.5:1 (WCAG AA)

Heuristic 9 — Help Users Recognize, Diagnose, and Recover from Errors
[ ] No browser-native validation bubbles
[ ] Inline error per field with aria-invalid + aria-describedby
[ ] Errors say what went wrong AND how to fix it
[ ] Focus moves to first invalid field on submit

Heuristic 10 — Help and Documentation
[ ] Persistent hints below non-obvious fields
[ ] How it Works before the form
[ ] Trust signals near CTA
[ ] Support contacts are mailto:/tel: links
[ ] Post-submit message explains next steps
```

---

## Scoring

After evaluation, calculate:

| Score | Assessment |
|---|---|
| 45–50 | Excellent — ready for production |
| 35–44 | Good — fix gaps before launch |
| 25–34 | Fair — significant rework needed |
| < 25 | Poor — redesign required |
