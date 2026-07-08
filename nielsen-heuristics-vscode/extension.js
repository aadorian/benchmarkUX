'use strict';

const vscode = require('vscode');

// ─── Constants ──────────────────────────────────────────────────────────────

const HEURISTIC_NAMES = {
  H1:  'Visibility of System Status',
  H2:  'Match Between System and the Real World',
  H3:  'User Control and Freedom',
  H4:  'Consistency and Standards',
  H5:  'Error Prevention',
  H6:  'Recognition Rather Than Recall',
  H7:  'Flexibility and Efficiency of Use',
  H8:  'Aesthetic and Minimalist Design',
  H9:  'Help Users Recognize, Diagnose, and Recover from Errors',
  H10: 'Help and Documentation'
};

const S = vscode.DiagnosticSeverity;

// ─── Check definitions ───────────────────────────────────────────────────────
//
// Each check has:
//   heuristic   — 'H1'–'H10'
//   id          — unique slug for this check
//   label       — short description (shown in report table)
//   message     — full diagnostic message
//   fix         — actionable fix hint
//   severity    — vscode.DiagnosticSeverity
//   languages   — optional string[], restrict to these languageIds
//
// Supply exactly ONE of:
//   pattern     — regex applied to full document text; each match becomes a finding
//   customCheck — (text: string, lang: string) => Array<{index, length}>
//
// Supply optional:
//   fileSkip    — (text: string) => boolean; if true, skip ALL matches for this check
//

const CHECKS = [

  // ── H1: Visibility of System Status ────────────────────────────────────────

  {
    heuristic: 'H1', id: 'submit-no-loading',
    label: 'Submit button without loading/disabled state',
    pattern: /<button[^>]*type=["']submit["'][^>]*>/gi,
    fileSkip: t => /(\.disabled\s*=\s*true|setAttribute.*disabled|spinner|btn-spinner|loading)/i.test(t),
    message: 'H1 — Visibility: Submit button has no loading or disabled state. Users get no feedback during processing.',
    fix: 'On click: button.disabled = true; toggle a spinner; restore after the response resolves.',
    severity: S.Warning
  },

  {
    heuristic: 'H1', id: 'form-no-feedback',
    label: 'Form with no visible success/error feedback',
    pattern: /<form[^>]*>/gi,
    fileSkip: t => /(success|toast|alert|aria-live|role=["']status|result-message|submitted)/i.test(t),
    message: 'H1 — Visibility: Form found but no success or error feedback pattern detected. Users never know if the submission worked.',
    fix: 'Add <div role="status" aria-live="polite" class="form-result"> and populate it on submit resolve/reject.',
    severity: S.Warning
  },

  {
    heuristic: 'H1', id: 'nav-no-active',
    label: 'Navigation with no active/current state',
    pattern: /<nav[^>]*>/gi,
    fileSkip: t => /(aria-current|\.active|class=["'][^"']*active[^"']*["'])/i.test(t),
    message: 'H1 — Visibility: Navigation found but no active/current state detected. Users cannot tell which section they are in.',
    fix: 'Add aria-current="page" to the current nav link, or toggle an .active class on scroll/route change.',
    severity: S.Information
  },

  // ── H2: Match Between System and the Real World ─────────────────────────────

  {
    heuristic: 'H2', id: 'img-no-alt',
    label: '<img> missing alt attribute',
    pattern: /<img(?![^>]*\balt=)[^>]*>/gi,
    message: 'H2 — Real World: <img> has no alt attribute. Screen readers and broken-image states show nothing meaningful.',
    fix: 'Add alt="[what the image shows]". Use alt="" + aria-hidden="true" for purely decorative images.',
    severity: S.Error
  },

  {
    heuristic: 'H2', id: 'svg-no-aria',
    label: '<svg> without aria-label or aria-hidden',
    pattern: /<svg(?![^>]*(?:aria-label|aria-hidden))[^>]*>/gi,
    message: 'H2 — Real World: <svg> has neither aria-label nor aria-hidden. Decorative icons confuse screen readers; meaningful icons are inaccessible.',
    fix: 'Decorative: aria-hidden="true". Meaningful: aria-label="[description]" + role="img".',
    severity: S.Warning
  },

  {
    heuristic: 'H2', id: 'cta-system-text',
    label: 'CTA button using system-action text',
    pattern: /<button[^>]*>\s*(Submit|Send|Execute|Process|OK|Search Query|POST|GET|Query)\s*<\/button>/gi,
    message: 'H2 — Real World: Button text describes the system action, not the user outcome.',
    fix: 'Replace "Submit" → "Apply to Adopt", "Send" → "Send My Message", etc. Describe what the user gets.',
    severity: S.Information
  },

  {
    heuristic: 'H2', id: 'technical-label',
    label: 'Form label with technical/system jargon',
    pattern: /<label[^>]*>[^<]*(?:\bID\b|\bUUID\b|\bEntity\b|\bRecord\b|\bNULL\b|\bString\b|\bPOST\b)[^<]*<\/label>/gi,
    message: 'H2 — Real World: Form label contains technical jargon not meaningful to users.',
    fix: 'Rewrite using plain user-facing language (e.g. "Your Order" not "Transaction Record").',
    severity: S.Warning
  },

  // ── H3: User Control and Freedom ───────────────────────────────────────────

  {
    heuristic: 'H3', id: 'bare-hash-link',
    label: 'href="#" — dead-end link with no target',
    pattern: /href=["']#["']/gi,
    message: 'H3 — User Control: href="#" scrolls unexpectedly to the top of the page. Users lose their place.',
    fix: 'Use href="#section-id" for scroll anchors, or <button type="button"> for JS-triggered actions.',
    severity: S.Warning
  },

  {
    heuristic: 'H3', id: 'modal-no-escape',
    label: 'Modal/dialog without Escape-key dismissal',
    pattern: /<dialog[^>]*>|class=["'][^"']*(?:modal|overlay|popup)[^"']*["']/gi,
    fileSkip: t => /(?:Escape|key.*Escape|keyCode.*27|e\.key.*=.*["']Escape)/i.test(t),
    message: 'H3 — User Control: Modal/dialog found but no Escape key handler detected. Users may feel trapped.',
    fix: 'Add: document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });',
    severity: S.Warning
  },

  {
    heuristic: 'H3', id: 'form-no-reset',
    label: 'Form without a clear/reset option',
    pattern: /<form[^>]*>/gi,
    fileSkip: t => /(type=["']reset["']|clearForm|resetForm|clear.form)/i.test(t),
    message: 'H3 — User Control: Form has no reset or clear option. Users cannot undo their input easily.',
    fix: 'Add <button type="reset">Clear Form</button> inside the form.',
    severity: S.Information
  },

  // ── H4: Consistency and Standards ──────────────────────────────────────────

  {
    heuristic: 'H4', id: 'inline-hardcoded-color',
    label: 'Hardcoded colour value in style attribute',
    pattern: /style=["'][^"']*#[0-9a-fA-F]{3,8}[^"']*["']/gi,
    message: 'H4 — Consistency: Inline style has a hardcoded hex colour. All colours should reference a design token.',
    fix: 'Define in :root { --color-name: #hex; } and reference with var(--color-name).',
    severity: S.Warning
  },

  {
    heuristic: 'H4', id: 'css-hardcoded-hex',
    label: 'Hardcoded hex colour outside :root in CSS',
    languages: ['css'],
    customCheck: (text) => {
      // Skip tokens declared inside :root
      const findings = [];
      // Remove :root block content from text before scanning
      const withoutRoot = text.replace(/:root\s*\{[^}]*\}/gs, match => ' '.repeat(match.length));
      // Remove comments
      const clean = withoutRoot.replace(/\/\*[\s\S]*?\*\//g, m => ' '.repeat(m.length));
      const re = /#[0-9a-fA-F]{3,8}\b/g;
      let m;
      while ((m = re.exec(clean)) !== null) {
        findings.push({ index: m.index, length: m[0].length });
      }
      return findings;
    },
    message: 'H4 — Consistency: Hardcoded hex colour outside :root. Move to a design token.',
    fix: 'Add to :root { --color-name: #hex; } then use var(--color-name) here.',
    severity: S.Information
  },

  {
    heuristic: 'H4', id: 'no-focus-visible',
    label: 'CSS has :focus but no :focus-visible rule',
    languages: ['css'],
    customCheck: (text) => {
      if (!/:focus/i.test(text)) return [];
      if (/focus-visible/i.test(text)) return [];
      const re = /:focus\b/gi;
      const m = re.exec(text);
      return m ? [{ index: m.index, length: m[0].length }] : [];
    },
    message: 'H4 — Consistency: CSS uses :focus but not :focus-visible. Mouse users see the focus ring; add :focus-visible to show it only for keyboard users.',
    fix: 'Replace :focus { outline: ... } with :focus-visible { outline: ... }',
    severity: S.Warning
  },

  // ── H5: Error Prevention ────────────────────────────────────────────────────

  {
    heuristic: 'H5', id: 'tel-no-pattern',
    label: 'Phone input without pattern constraint',
    pattern: /<input[^>]*type=["']tel["'](?![^>]*pattern=)[^>]*>/gi,
    message: 'H5 — Error Prevention: Phone input has no pattern attribute. Any string is accepted, causing downstream errors.',
    fix: 'Add pattern="[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}" to the input.',
    severity: S.Warning
  },

  {
    heuristic: 'H5', id: 'textarea-no-minlength',
    label: '<textarea> without minlength/maxlength',
    pattern: /<textarea(?![^>]*minlength)[^>]*>/gi,
    message: 'H5 — Error Prevention: <textarea> has no minlength/maxlength. Empty or excessively long submissions pass through.',
    fix: 'Add minlength="30" maxlength="1000" (adjust to your requirements).',
    severity: S.Warning
  },

  {
    heuristic: 'H5', id: 'email-wrong-type',
    label: 'Email field using type="text" instead of type="email"',
    pattern: /<input[^>]*type=["']text["'][^>]*(?:name|id|placeholder)=["'][^"']*(?:email|mail)[^"']*["'][^>]*>/gi,
    message: 'H5 — Error Prevention: Email field uses type="text". Built-in format validation is disabled.',
    fix: 'Change type="text" to type="email".',
    severity: S.Error
  },

  {
    heuristic: 'H5', id: 'select-two-options',
    label: '<select> with only 2 options (should be radio cards)',
    customCheck: (text) => {
      const findings = [];
      const selectRe = /<select[^>]*>([\s\S]*?)<\/select>/gi;
      let m;
      while ((m = selectRe.exec(text)) !== null) {
        const inner = m[1];
        const opts = inner.match(/<option/gi);
        if (opts && opts.length === 2) {
          findings.push({ index: m.index, length: m[0].length });
        }
      }
      return findings;
    },
    message: 'H5 — Error Prevention: <select> has only 2 options. Replace with visible radio card buttons so both choices are always on screen.',
    fix: 'Use <label class="radio-card"><input type="radio" ...> Label</label> pairs for binary choices.',
    severity: S.Information
  },

  // ── H6: Recognition Rather Than Recall ─────────────────────────────────────

  {
    heuristic: 'H6', id: 'placeholder-only-label',
    label: 'Input with placeholder but no associated <label>',
    customCheck: (text) => {
      const findings = [];
      // Find inputs with an id and a placeholder
      const inputRe = /<input[^>]*\bid=["']([^"']+)["'][^>]*placeholder=["'][^"']+["'][^>]*>|<input[^>]*placeholder=["'][^"']+["'][^>]*\bid=["']([^"']+)["'][^>]*>/gi;
      let m;
      while ((m = inputRe.exec(text)) !== null) {
        const id = m[1] || m[2];
        if (!id) continue;
        if (!new RegExp(`for=["']${id}["']`, 'i').test(text)) {
          findings.push({ index: m.index, length: m[0].length });
        }
      }
      return findings;
    },
    message: 'H6 — Recognition: Input has only a placeholder as its label. Placeholder text disappears on focus — add a persistent <label for="...">.',
    fix: 'Add <label for="[id]">[Field Name]</label> above the input. Never rely on placeholder alone.',
    severity: S.Error
  },

  {
    heuristic: 'H6', id: 'section-no-id',
    label: '<section> without id — cannot be nav-anchored',
    pattern: /<section(?![^>]*\bid=)[^>]*>/gi,
    message: 'H6 — Recognition: <section> has no id. Navigation links cannot point to it directly; users cannot share a deep link.',
    fix: 'Add id="[section-name]" to the <section> tag and add a matching href="#section-name" in the nav.',
    severity: S.Information
  },

  {
    heuristic: 'H6', id: 'required-no-marker',
    label: 'Required fields with no visual asterisk/legend',
    pattern: /<input[^>]*required[^>]*>/gi,
    fileSkip: t => /(\*\s*[Rr]equired|aria-label=["'][^"']*required|class=["'][^"']*required|form-legend)/i.test(t),
    message: 'H6 — Recognition: Required fields exist but no visual required marker (*) or legend is found.',
    fix: 'Add <span aria-label="required">*</span> inside each required label; add <p class="form-legend"><span aria-hidden="true">*</span> Required</p>.',
    severity: S.Information
  },

  // ── H7: Flexibility and Efficiency of Use ──────────────────────────────────

  {
    heuristic: 'H7', id: 'div-onclick',
    label: '<div> with onclick — not keyboard-accessible',
    pattern: /<div[^>]*onclick=/gi,
    message: 'H7 — Flexibility: <div onclick> is not keyboard-accessible. Tab key and Enter/Space do not trigger it.',
    fix: 'Replace with <button type="button" onclick="..."> or add tabindex="0" + keydown listener for Enter/Space.',
    severity: S.Error
  },

  {
    heuristic: 'H7', id: 'anchor-no-smooth-scroll',
    label: 'Anchor links without smooth-scroll behaviour',
    pattern: /href=["']#[a-zA-Z][^"']*["']/gi,
    fileSkip: t => /(scroll-behavior\s*:\s*smooth|scrollIntoView.*smooth|scrollTo.*smooth)/i.test(t),
    message: 'H7 — Flexibility: Anchor links found but no smooth-scroll detected. Hard jumps disorient users.',
    fix: 'Add html { scroll-behavior: smooth; } in CSS, or use JS: el.scrollIntoView({ behavior: "smooth", block: "start" }).',
    severity: S.Information
  },

  {
    heuristic: 'H7', id: 'filter-causes-reload',
    label: 'Filter/sort triggers full page reload',
    pattern: /(?:filter|sort)[^=]*\.addEventListener\s*\([^)]*["']click["'][^)]*\)[^{]*\{[^}]*(?:location\.reload|window\.location\s*=)/gi,
    message: 'H7 — Flexibility: Filter or sort causes a full page reload. Results should update in-place for efficiency.',
    fix: 'Use JS to filter/sort the in-memory data array and re-render the results list without reloading.',
    severity: S.Warning
  },

  // ── H8: Aesthetic and Minimalist Design ────────────────────────────────────

  {
    heuristic: 'H8', id: 'animation-no-reduced-motion',
    label: 'Animation without prefers-reduced-motion override',
    pattern: /(?:@keyframes\s+\w+|animation\s*:[^;{]+;)/gi,
    fileSkip: t => /prefers-reduced-motion/i.test(t),
    message: 'H8 — Minimalist: Animation defined but no @media (prefers-reduced-motion: reduce) override found. Fails WCAG 2.3.3.',
    fix: 'Add: @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }',
    severity: S.Warning
  },

  {
    heuristic: 'H8', id: 'decorative-no-aria-hidden',
    label: 'Decorative element without aria-hidden',
    pattern: /<(?:div|span|canvas)[^>]*class=["'][^"']*(?:decoration|ornament|bg-anim|particle|confetti|backdrop|wave|blob|bubble)[^"']*["'](?![^>]*aria-hidden)[^>]*>/gi,
    message: 'H8 — Minimalist: Decorative element has no aria-hidden="true". Screen readers announce it unnecessarily.',
    fix: 'Add aria-hidden="true" and pointer-events: none; to the element.',
    severity: S.Warning
  },

  // ── H9: Help Users Recognize, Diagnose, and Recover from Errors ────────────

  {
    heuristic: 'H9', id: 'required-no-aria-describedby',
    label: 'Required field without aria-describedby (no error wiring)',
    pattern: /<input[^>]*required(?![^>]*aria-describedby)[^>]*>/gi,
    message: 'H9 — Error Recovery: Required input has no aria-describedby. Inline error messages won\'t be announced by screen readers.',
    fix: 'Add aria-describedby="[field-id]-error" to the input; add <span id="[field-id]-error" role="alert"> below it.',
    severity: S.Warning
  },

  {
    heuristic: 'H9', id: 'no-aria-invalid',
    label: 'Form with no aria-invalid usage',
    pattern: /<form[^>]*>/gi,
    fileSkip: t => /aria-invalid/i.test(t),
    message: 'H9 — Error Recovery: Form exists but aria-invalid is never set. Failing fields are not announced as invalid to screen readers.',
    fix: 'In validation JS: field.setAttribute("aria-invalid", field.validity.valid ? "false" : "true");',
    severity: S.Warning
  },

  {
    heuristic: 'H9', id: 'generic-error-message',
    label: 'Generic error message text',
    pattern: /["'`](?:Something went wrong|An error occurred|Invalid input|Error|Failed|Oops)["'`]/gi,
    message: 'H9 — Error Recovery: Generic error text detected. Error messages must say what went wrong and how to fix it.',
    fix: 'Replace with a specific message, e.g. "Please enter a valid email address (e.g. you@example.com)."',
    severity: S.Warning
  },

  // ── H10: Help and Documentation ────────────────────────────────────────────

  {
    heuristic: 'H10', id: 'plain-text-email',
    label: 'Email address not wrapped in a mailto: link',
    customCheck: (text) => {
      const findings = [];
      const re = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
      let m;
      while ((m = re.exec(text)) !== null) {
        const ctx = text.substring(Math.max(0, m.index - 25), m.index);
        if (/mailto:/i.test(ctx) || /href=/i.test(ctx)) continue;
        findings.push({ index: m.index, length: m[0].length });
      }
      return findings;
    },
    message: 'H10 — Documentation: Email address is plain text. Mobile users and screen reader users cannot activate it directly.',
    fix: 'Wrap in <a href="mailto:[address]">[address]</a>.',
    severity: S.Warning
  },

  {
    heuristic: 'H10', id: 'plain-text-phone',
    label: 'Phone number not wrapped in a tel: link',
    customCheck: (text) => {
      const findings = [];
      const re = /(?<!\d)(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}(?!\d)/g;
      let m;
      while ((m = re.exec(text)) !== null) {
        const ctx = text.substring(Math.max(0, m.index - 15), m.index);
        if (/tel:|href=/i.test(ctx)) continue;
        findings.push({ index: m.index, length: m[0].length });
      }
      return findings;
    },
    message: 'H10 — Documentation: Phone number is plain text. Mobile users cannot tap-to-call.',
    fix: 'Wrap in <a href="tel:+1XXXXXXXXXX">[formatted number]</a>.',
    severity: S.Warning
  },

  {
    heuristic: 'H10', id: 'textarea-no-hint',
    label: '<textarea> without persistent hint text',
    pattern: /<textarea(?![^>]*aria-describedby)[^>]*>/gi,
    message: 'H10 — Documentation: Textarea has no aria-describedby hint. Users don\'t know what or how much to write.',
    fix: 'Add aria-describedby="[id]-hint" to the textarea; add <span id="[id]-hint" class="field-hint">...</span> below it.',
    severity: S.Information
  }

];

// ─── Module state ────────────────────────────────────────────────────────────

/** @type {vscode.DiagnosticCollection} */
let diagnosticCollection;

/** @type {vscode.WebviewPanel | undefined} */
let reportPanel;

/** @type {Map<string, vscode.Diagnostic[]>} */
const lastResults = new Map();

// ─── Extension lifecycle ─────────────────────────────────────────────────────

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('nielsen');
  context.subscriptions.push(diagnosticCollection);

  context.subscriptions.push(
    vscode.commands.registerCommand('nielsen.reviewFile', cmdReviewFile),
    vscode.commands.registerCommand('nielsen.reviewSelection', cmdReviewSelection),
    vscode.commands.registerCommand('nielsen.clearDiagnostics', cmdClear),
    vscode.commands.registerCommand('nielsen.showReport', cmdShowReport)
  );

  // Auto-review on save if setting enabled
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(doc => {
      const cfg = vscode.workspace.getConfiguration('nielsen');
      if (cfg.get('reviewOnSave') && ['html', 'css', 'javascript'].includes(doc.languageId)) {
        runReview(doc, null);
      }
    })
  );

  // Clean up diagnostics when a file is closed
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument(doc => {
      diagnosticCollection.delete(doc.uri);
      lastResults.delete(doc.uri.toString());
    })
  );
}

function deactivate() {
  if (reportPanel) reportPanel.dispose();
}

// ─── Commands ────────────────────────────────────────────────────────────────

function cmdReviewFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('Nielsen: No active editor.');
    return;
  }
  runReview(editor.document, null);
}

function cmdReviewSelection() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selection.isEmpty) {
    vscode.window.showWarningMessage('Nielsen: No text selected.');
    return;
  }
  const selection = editor.selection;
  const text = editor.document.getText(selection);
  const offset = editor.document.offsetAt(selection.start);
  runReview(editor.document, { text, offset });
}

function cmdClear() {
  diagnosticCollection.clear();
  lastResults.clear();
  if (reportPanel) {
    reportPanel.webview.html = buildReportHtml([], 'Diagnostics cleared');
  }
}

function cmdShowReport() {
  const editor = vscode.window.activeTextEditor;
  const key = editor?.document.uri.toString();
  const diags = key ? (lastResults.get(key) || []) : [];
  openReportPanel(editor?.document, diags);
}

// ─── Core analysis ───────────────────────────────────────────────────────────

/**
 * @param {vscode.TextDocument} document
 * @param {{ text: string, offset: number } | null} selectionCtx
 */
function runReview(document, selectionCtx) {
  const fullText = document.getText();
  const lang = document.languageId;
  const analysisText = selectionCtx ? selectionCtx.text : fullText;
  const baseOffset = selectionCtx ? selectionCtx.offset : 0;

  const diagnostics = analyse(analysisText, lang, document, baseOffset);

  diagnosticCollection.set(document.uri, diagnostics);
  lastResults.set(document.uri.toString(), diagnostics);

  const cfg = vscode.workspace.getConfiguration('nielsen');
  if (cfg.get('showReportPanel', true)) {
    openReportPanel(document, diagnostics);
  }

  const counts = { errors: 0, warnings: 0, info: 0 };
  for (const d of diagnostics) {
    if (d.severity === S.Error) counts.errors++;
    else if (d.severity === S.Warning) counts.warnings++;
    else counts.info++;
  }

  const label = selectionCtx ? 'selection' : 'file';
  vscode.window.showInformationMessage(
    `Nielsen review: ${diagnostics.length} issues in ${label} — ` +
    `${counts.errors} errors, ${counts.warnings} warnings, ${counts.info} info. ` +
    `See Problems panel or report.`
  );
}

/**
 * Run all checks against the given text. Returns VSCode Diagnostics.
 *
 * @param {string} text
 * @param {string} lang
 * @param {vscode.TextDocument} document
 * @param {number} baseOffset  offset into the document where analysis text starts
 * @returns {vscode.Diagnostic[]}
 */
function analyse(text, lang, document, baseOffset) {
  const diagnostics = [];

  for (const check of CHECKS) {
    // Language restriction
    if (check.languages && !check.languages.includes(lang)) continue;

    // File-level skip
    if (check.fileSkip && check.fileSkip(text, lang)) continue;

    /** @type {Array<{index: number, length: number}>} */
    let findings = [];

    if (check.customCheck) {
      findings = check.customCheck(text, lang);
    } else if (check.pattern) {
      check.pattern.lastIndex = 0;
      let m;
      while ((m = check.pattern.exec(text)) !== null) {
        findings.push({ index: m.index, length: m[0].length });
      }
      check.pattern.lastIndex = 0;
    }

    for (const f of findings) {
      const absIndex = baseOffset + f.index;
      const startPos = document.positionAt(absIndex);
      const endPos = document.positionAt(absIndex + f.length);
      const range = new vscode.Range(startPos, endPos);

      const diag = new vscode.Diagnostic(range, check.message, check.severity);
      diag.source = `Nielsen ${check.heuristic}`;
      diag.code = { value: check.id, target: vscode.Uri.parse(`https://www.nngroup.com/articles/ten-usability-heuristics/`) };

      // Store extra info for the report panel
      diag._checkLabel = check.label;
      diag._fix = check.fix;
      diag._heuristic = check.heuristic;

      diagnostics.push(diag);
    }
  }

  return diagnostics;
}

// ─── Report webview ──────────────────────────────────────────────────────────

/**
 * @param {vscode.TextDocument | undefined} document
 * @param {vscode.Diagnostic[]} diagnostics
 */
function openReportPanel(document, diagnostics) {
  if (reportPanel) {
    reportPanel.reveal(vscode.ViewColumn.Beside);
  } else {
    reportPanel = vscode.window.createWebviewPanel(
      'nielsen.report',
      'Nielsen Report',
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      { enableScripts: true }
    );
    reportPanel.onDidDispose(() => { reportPanel = undefined; });
  }

  reportPanel.webview.html = buildReportHtml(diagnostics, document?.fileName ?? 'Unknown file');
}

/**
 * Build the HTML string for the report webview.
 *
 * @param {vscode.Diagnostic[]} diagnostics
 * @param {string} fileName
 * @returns {string}
 */
function buildReportHtml(diagnostics, fileName) {
  // Group by heuristic
  /** @type {Record<string, vscode.Diagnostic[]>} */
  const byHeuristic = {};
  for (const h of Object.keys(HEURISTIC_NAMES)) byHeuristic[h] = [];
  for (const d of diagnostics) {
    const h = d._heuristic || 'H?';
    if (byHeuristic[h]) byHeuristic[h].push(d);
  }

  // Compute per-heuristic score (5 = perfect, 1 = has errors)
  function score(h) {
    const diags = byHeuristic[h] || [];
    if (diags.length === 0) return 5;
    const hasError = diags.some(d => d.severity === S.Error);
    const hasWarn  = diags.some(d => d.severity === S.Warning);
    if (hasError) return 2;
    if (hasWarn)  return 3;
    return 4;
  }

  const totalScore = Object.keys(HEURISTIC_NAMES).reduce((s, h) => s + score(h), 0);
  const scoreLabel = totalScore >= 45 ? 'Excellent' :
                     totalScore >= 35 ? 'Good — fix gaps before launch' :
                     totalScore >= 25 ? 'Fair — significant rework needed' :
                                        'Poor — redesign required';

  const errorCount   = diagnostics.filter(d => d.severity === S.Error).length;
  const warningCount = diagnostics.filter(d => d.severity === S.Warning).length;
  const infoCount    = diagnostics.filter(d => d.severity === S.Information).length;

  function severityIcon(sev) {
    if (sev === S.Error)       return '<span class="icon error">✖</span>';
    if (sev === S.Warning)     return '<span class="icon warn">⚠</span>';
    return                            '<span class="icon info">ℹ</span>';
  }

  function severityClass(sev) {
    if (sev === S.Error)   return 'error';
    if (sev === S.Warning) return 'warn';
    return 'info';
  }

  function scoreColor(s) {
    if (s >= 5) return '#22c55e';
    if (s >= 4) return '#84cc16';
    if (s >= 3) return '#eab308';
    return '#ef4444';
  }

  // Score grid
  const scoreGrid = Object.keys(HEURISTIC_NAMES).map(h => {
    const s = score(h);
    const color = scoreColor(s);
    return `
      <div class="score-cell" style="border-left: 3px solid ${color}">
        <span class="score-h">${h}</span>
        <span class="score-val" style="color:${color}">${s}/5</span>
        <span class="score-name">${HEURISTIC_NAMES[h]}</span>
        <span class="score-count">${(byHeuristic[h]||[]).length} issue${(byHeuristic[h]||[]).length !== 1 ? 's' : ''}</span>
      </div>`;
  }).join('');

  // Violations per heuristic
  const sections = Object.keys(HEURISTIC_NAMES).map(h => {
    const diags = byHeuristic[h] || [];
    if (diags.length === 0) {
      return `
        <section class="heuristic pass">
          <h3><span class="badge pass-badge">${h}</span> ${HEURISTIC_NAMES[h]} <span class="pass-label">✓ No violations</span></h3>
        </section>`;
    }

    const rows = diags.map(d => {
      const line = d.range.start.line + 1;
      const col  = d.range.start.character + 1;
      return `
        <div class="violation ${severityClass(d.severity)}">
          <div class="v-header">
            ${severityIcon(d.severity)}
            <span class="v-label">${escHtml(d._checkLabel || '')}</span>
            <span class="v-loc">line ${line}:${col}</span>
          </div>
          <p class="v-message">${escHtml(d.message)}</p>
          <p class="v-fix"><strong>Fix:</strong> ${escHtml(d._fix || '')}</p>
        </div>`;
    }).join('');

    return `
      <section class="heuristic">
        <h3><span class="badge">${h}</span> ${HEURISTIC_NAMES[h]}</h3>
        ${rows}
      </section>`;
  }).join('');

  const shortFile = fileName.split('/').pop() || fileName;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nielsen Heuristics Report</title>
<style>
  :root {
    --bg: #1e1e1e;
    --surface: #252526;
    --surface2: #2d2d2d;
    --border: #3c3c3c;
    --text: #cccccc;
    --text-muted: #808080;
    --red: #f48771;
    --yellow: #cca700;
    --blue: #75beff;
    --green: #89d185;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); font-size: 13px; line-height: 1.5; padding: 20px; }
  h1 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
  h3 { font-size: 13px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .file { color: var(--text-muted); font-size: 11px; margin-bottom: 24px; }

  /* Summary bar */
  .summary { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
  .stat { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 12px 16px; min-width: 100px; }
  .stat-num { font-size: 28px; font-weight: 700; }
  .stat-num.error { color: var(--red); }
  .stat-num.warn { color: var(--yellow); }
  .stat-num.info { color: var(--blue); }
  .stat-num.total { color: var(--text); }
  .stat-label { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

  /* Score card */
  .score-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 24px; }
  .score-total { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .score-label { font-size: 11px; color: var(--text-muted); margin-bottom: 16px; }
  .score-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
  .score-cell { background: var(--surface2); border-radius: 6px; padding: 8px 10px; display: flex; flex-direction: column; gap: 2px; }
  .score-h { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
  .score-val { font-size: 16px; font-weight: 700; }
  .score-name { font-size: 11px; color: var(--text); }
  .score-count { font-size: 10px; color: var(--text-muted); }

  /* Heuristic sections */
  .heuristic { margin-bottom: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 14px; }
  .heuristic.pass h3 { color: var(--text-muted); }
  .badge { background: #3c3c3c; color: var(--text); padding: 1px 6px; border-radius: 3px; font-size: 11px; font-weight: 700; }
  .pass-badge { background: #1a3a1a; color: var(--green); }
  .pass-label { font-size: 11px; color: var(--green); font-weight: 400; margin-left: 4px; }

  /* Violation cards */
  .violation { border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; border-left: 3px solid; }
  .violation.error  { background: #2d1a1a; border-color: var(--red); }
  .violation.warn   { background: #2a2500; border-color: var(--yellow); }
  .violation.info   { background: #1a2535; border-color: var(--blue); }
  .v-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
  .v-label { font-weight: 600; flex: 1; }
  .v-loc { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
  .v-message { font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
  .v-fix { font-size: 12px; color: var(--text); }
  .v-fix strong { color: var(--green); }
  .icon { font-size: 12px; }
  .icon.error  { color: var(--red); }
  .icon.warn   { color: var(--yellow); }
  .icon.info   { color: var(--blue); }
</style>
</head>
<body>
<h1>Nielsen Usability Review</h1>
<p class="file">📄 ${escHtml(shortFile)}</p>

<div class="summary">
  <div class="stat"><div class="stat-num error">${errorCount}</div><div class="stat-label">Errors</div></div>
  <div class="stat"><div class="stat-num warn">${warningCount}</div><div class="stat-label">Warnings</div></div>
  <div class="stat"><div class="stat-num info">${infoCount}</div><div class="stat-label">Info</div></div>
  <div class="stat"><div class="stat-num total">${diagnostics.length}</div><div class="stat-label">Total issues</div></div>
</div>

<div class="score-card">
  <div class="score-total">${totalScore}/50</div>
  <div class="score-label">${scoreLabel}</div>
  <div class="score-grid">${scoreGrid}</div>
</div>

${sections}
</body>
</html>`;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = { activate, deactivate };
