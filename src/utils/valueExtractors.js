export const valueExtractors = {
    checkbox: (el) => el.checked,
    radio: (el, name, form) => {
      const checked = form.querySelector(`input[name="${name}"]:checked`);
      return checked ? checked.value : '';
    },
    default: (el) => el.value,
  };
  
  /**
   * Gets the value from a form element.
   * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} el The form element.
   * @param {HTMLFormElement} [form] Optional reference to the form, needed for radio/checkbox groups.
   * @returns {string|boolean|string[]|null} The value of the element.
   */
  export function getInputValue(el, form) {
    const type = el.type;
    const name = el.name;

    // Handle Radio buttons
    if (type === 'radio') {
      if (el.checked) {
        return el.value;
      } else {
        // If the passed radio is not checked, find the checked one in the same group within the form
        if (form && name) {
          const checkedRadio = form.querySelector(`input[type="radio"][name="${name}"]:checked`);
          return checkedRadio ? checkedRadio.value : null;
        }
        return null; // No form ref or no checked radio found
      }
    }

    // Handle Checkboxes (single and groups)
    if (type === 'checkbox') {
      if (name && name.endsWith('[]') && form) {
        // Checkbox group (name ends with [])
        const groupCheckboxes = form.querySelectorAll(`input[type="checkbox"][name="${name}"]:checked`);
        return Array.from(groupCheckboxes).map(cb => cb.value);
      } else {
        // Single checkbox
        return el.checked;
      }
    }

    // Handle File inputs
    if (type === 'file') {
      return null; // Or return el.files (FileList object)
      // Avoid returning el.value which is just the filename/path
    }

    // Handle Select (including multiple)
    if (el.tagName === 'SELECT') {
      if (el.multiple) {
        return Array.from(el.selectedOptions).map(option => option.value);
      }
      return el.value;
    }

    // Handle other input types (text, email, password, textarea, etc.)
    return el.value !== undefined ? el.value : null;
  }