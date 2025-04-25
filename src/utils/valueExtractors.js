const inputValueExtractors = {
  radio: (el, form, name) => {
    // Logic for radio buttons...
    if (el.checked) return el.value;
    if (form && name) {
        const checkedRadio = form.querySelector(`input[type="radio"][name="${name}"]:checked`);
        return checkedRadio ? checkedRadio.value : null;
    }
    return null;
  },
  checkbox: (el, form, name) => {
    // Logic for checkboxes (single and group)...
     if (name && name.endsWith('[]') && form) {
        const groupCheckboxes = form.querySelectorAll(`input[type="checkbox"][name="${name}"]:checked`);
        return Array.from(groupCheckboxes).map(cb => cb.value);
      } else {
        return el.checked;
      }
  },
  file: (el, form, name) => {
    // Return FileList
    return el.files; 
  },
  select: (el, form, name) => {
     // Logic for select (single and multiple)...
     if (el.multiple) {
        return Array.from(el.selectedOptions).map(option => option.value);
      }
      return el.value;
  },
  default: (el, form, name) => {
    // Default logic for text, email, password, etc.
    return el.value !== undefined ? el.value : null;
  }
};

export function getInputValue(el, form) {
  const type = el.type;
  const tagName = el.tagName;
  const name = el.name;
  
  let handler;
  if (tagName === 'SELECT') {
      handler = inputValueExtractors.select;
  } else if (inputValueExtractors[type]) {
      handler = inputValueExtractors[type];
  } else {
      handler = inputValueExtractors.default;
  }

  return handler(el, form, name);
}