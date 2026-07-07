const DRAFT_KEY = 'findapaw_draft';
const SUBMISSIONS_KEY = 'findapaw_submissions';

export function saveDraft(formData) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
}

export function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY)) || {};
  } catch {
    return {};
  }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export function saveSubmission(formData) {
  const submissions = loadSubmissions();
  submissions.push({ ...formData, submittedAt: new Date().toISOString() });
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
}

export function loadSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY)) || [];
  } catch {
    return [];
  }
}
