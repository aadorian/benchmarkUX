import { saveDraft, loadDraft, clearDraft, saveSubmission } from '../findapaw-persistence.js';

const FORM_FIELDS = ['fullName', 'email', 'phone', 'message'];

function getFormData(form) {
  const data = Object.fromEntries(
    FORM_FIELDS.map(id => [id, form.elements[id].value])
  );
  const homeType = form.elements['homeType'];
  data.homeType = homeType.value;
  return data;
}

function restoreDraft(form, draft) {
  FORM_FIELDS.forEach(id => {
    if (draft[id]) form.elements[id].value = draft[id];
  });
  if (draft.homeType) {
    const radio = form.querySelector(`input[name="homeType"][value="${draft.homeType}"]`);
    if (radio) radio.checked = true;
  }
}

function showSuccess() {
  document.getElementById('adoptionForm').style.display = 'none';
  document.getElementById('successState').style.display = 'block';
  document.querySelector('.form-header').style.display = 'none';
}

function init() {
  const form = document.getElementById('adoptionForm');
  if (!form) return;

  restoreDraft(form, loadDraft());

  form.addEventListener('input', () => saveDraft(getFormData(form)));
  form.querySelector('input[name="homeType"]')
      ?.closest('.radio-group')
      ?.addEventListener('change', () => saveDraft(getFormData(form)));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = getFormData(form);
    saveSubmission(data);
    clearDraft();
    showSuccess();
  });
}

init();
