export default {
  mounted(el, binding) {
    updateLabel(el, binding);
  },
  updated(el, binding) {
    // Remove existing label first
    const previousLabel = el.previousElementSibling;
    if (previousLabel && previousLabel.tagName === 'LABEL') {
      previousLabel.remove();
    }
    
    // Add new label
    updateLabel(el, binding);
  }
};

function updateLabel(el, binding) {
  const lblText = binding.value;
  if (!lblText) return;

  const name = el.getAttribute('name') || '';

  const labelEl = document.createElement('label');
  if (name) labelEl.setAttribute('for', name);
  labelEl.textContent = lblText;
  el.insertAdjacentElement('beforebegin', labelEl);

  const parent = el.parentElement;
  if (parent) {
    parent.classList.add('form-group');
    if (name) parent.classList.add(`form-group-${name}`);
  }
}