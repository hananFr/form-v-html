import { reactive, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { getInputValue } from '../utils/valueExtractors';
import { validateRules, defaultMessages } from '../utils/validationRules';
import { filtersRules } from '../utils/filtersRules';

// Helper function to get the specific filter function for an element
const getFilterFunction = (el) => {
    const filterRules = parseFilter(el); // Assumes parseFilter is defined below and accessible
    if (filterRules.length > 0) {
        const filterName = filterRules[0][1]; // Gets the name like 'digitsOnly'
        return filtersRules[filterName] || null;
    }
    return null;
};

// Helper function to parse filter attribute (keep it accessible)
const parseFilter = (el) => {
  const out = [];
  if (el.dataset.filter) out.push(['filter', el.dataset.filter]);
  return out;
};

export function useForm(props, emit, rootRef) {
  const formRef = ref(null);
  const errors = reactive({});
  const listeners = [];

  const addListener = (el, evt, fn) => {
    el.addEventListener(evt, fn);
    listeners.push(() => el.removeEventListener(evt, fn));
  };

  
  const wrapWithGroupAndLabel = (el) => {
    console.log('[wrap] Checking element:', el); // Log which element is being processed

    // Don't handle if not an element or already wrapped
    if (el.nodeType !== 1) {
        console.log('[wrap] Not an element node, skipping.');
        return;
    }
    if (el.parentElement && el.parentElement.classList.contains('form-group')) {
        console.log('[wrap] Already wrapped in form-group, skipping.');
        return;
    }

    // Get label text from directive or attributes
    const vLabel = el._vLabel;
    const dataLabel = el.getAttribute('data-label');
    const labelAttr = el.getAttribute('label');
    console.log(`[wrap] vLabel: "${vLabel}", data-label: "${dataLabel}", label: "${labelAttr}"`);
    
    let lblText = vLabel || dataLabel || labelAttr;
    if (!lblText) {
        console.log('[wrap] No label text found, skipping wrapping.');
        return; // No label text found, do nothing
    }
    console.log('[wrap] Found label text:', lblText);

    const name = el.name || '';
    const originalParent = el.parentNode; // Get parent BEFORE moving the element
    console.log('[wrap] Original parent:', originalParent);

    // Cannot wrap if element is not currently in the DOM
    if (!originalParent) {
        console.log('[wrap] No original parent found, skipping.');
        return;
    }

    // Avoid double-wrapping based on previous sibling label (basic check)
    if (el.previousElementSibling && el.previousElementSibling.tagName === 'LABEL' && 
        el.parentElement === originalParent) { 
        console.log('[wrap] Previous sibling is a LABEL, skipping wrapping.');
         // return; // Uncomment to skip if label found
    }

    console.log('[wrap] Proceeding to create wrapper and label...'); // Log before creation

    // 1. Create the wrapper div
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-group');
    if (name) wrapper.classList.add(`form-group-${name}`);

    // 2. Create the label
    const labelEl = document.createElement('label');
    if (name) labelEl.setAttribute('for', name); // Set 'for' attribute if input has a name
    labelEl.textContent = lblText;

    // 3. Get the element's next sibling BEFORE moving the element
    const nextSibling = el.nextSibling;

    // 4. Append the label and the original element to the wrapper
    wrapper.appendChild(labelEl);
    wrapper.appendChild(el);

    // 5. Insert the wrapper into the original parent where 'el' used to be
    originalParent.insertBefore(wrapper, nextSibling);
    console.log('[wrap] Wrapping complete for:', el); // Log completion
  };

  const handleError = (el, error) => {
    const name = el.name;
    const had = !!errors[name];
    if (error) {
      errors[name] = error;
      if (props.errorPlacement === 'parent' || props.errorPlacement === 'export')
        emit('validation-errors', { ...errors });
      el.setAttribute('aria-invalid', 'true');
    } else {
      delete errors[name];
      el.removeAttribute('aria-invalid');
      if ((props.errorPlacement === 'parent' || props.errorPlacement === 'export') && had)
        emit('validation-errors', { ...errors });
    }
  };

  const parseValidations = (el) => {
    const out = [];
    if (el.required) out.push(['required', true]);
    if (el.minLength > 0) out.push(['min', el.minLength]);
    if (el.maxLength > -1) out.push(['max', el.maxLength]);
    if (el.type === 'email') out.push(['email', true]);
    if (el.dataset.regex) out.push(['regex', el.dataset.regex]);
    if (el.dataset.match) out.push(['match', el.dataset.match]);
    return out;
  };

  const runFilter = (el) => {
    let filteredValue = getInputValue(el, formRef.value); // Start with current value
    const filterFn = getFilterFunction(el);
    if (filterFn) {
        // Apply the filter function to the whole value
        // This is useful for applying the filter logic consistently (e.g., after paste)
        filteredValue = filterFn(filteredValue);
    }
    return filteredValue; // Return the final filtered value
  };
  const runValidation = (el) => {
    const val = getInputValue(el, formRef.value);
    for (const [rule, param] of parseValidations(el)) {
      const fn = validateRules[rule];
      if (fn) {
        const err = fn(val, param, defaultMessages, param);
        if (err) return err;
      }
    }
    return '';
  };

  const validateField = (el) => {
    const error = runValidation(el);
    // DOM error placement
    if (props.errorPlacement !== 'export') {
        const selector = `[data-error-for="${el.name}"]`;
        let container = formRef.value.querySelector(selector);

        if (!error && container) {
            // No error, remove container
            container.remove();
            // Remove error class directly from the input element 'el'
            if (el) {
                el.classList.remove('input-error');
            }
        }

        if (error && !container) {
            // Error, no container yet. Add class to input and create container.
            if (el) {
                el.classList.add('input-error');
            }
            const position = props.errorPlacement === 'above-input' ? 'beforebegin' : 'afterend';
            container = document.createElement('div');
            container.dataset.errorFor = el.name;
            container.className = props.errorClass || 'error-message';
            container.setAttribute('role', 'alert');
            container.textContent = props.errorTemplate + error;
            // Insert relative to the input element 'el'
            if (el) {
                 el.insertAdjacentElement(position, container);
            }
      } else if (error && container) {
            // Error, container exists. Update text and ensure class is on input.
            container.textContent = props.errorTemplate + error;
             if (el && !el.classList.contains('input-error')) {
                el.classList.add('input-error');
             }
      }
    }
    handleError(el, error);
    return !error;
  };

  const validateAll = () => {
    let ok = true;
    formRef.value.querySelectorAll('input,select,textarea').forEach((el) => {
      if (!validateField(el)) ok = false;
    });
    return ok;
  };

  const updateModel = (el) => {
    const name = el.name;
    if (!name) return;
    const val = getInputValue(el, formRef.value);
    emit('update:modelValue', { ...props.modelValue, [name]: val });
  };

  const setupInput = (el) => {
    wrapWithGroupAndLabel(el); // <-- existing feature

    const { name } = el;
    if (!name) return;

    const filterFn = getFilterFunction(el);
    const isFilterableInput = ['text', 'tel', 'number', 'search', 'url', 'password', 'email'].includes(el.type) || el.tagName === 'TEXTAREA';

    // --- Event Listeners --- //

    // 1. Keydown Listener (for filtering keys in real-time)
    if (filterFn && isFilterableInput) {
        addListener(el, 'keydown', (event) => {
            const key = event.key;
            const isCtrlOrMeta = event.ctrlKey || event.metaKey; // Handle Ctrl/Cmd

            // Allow: Backspace, Delete, Tab, Escape, Enter
            if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(key)) {
                return;
            }

            // Allow: Arrow keys, Home, End
            if (key.startsWith('Arrow') || key === 'Home' || key === 'End') {
                 return;
            }

            // Allow: Ctrl/Cmd + A, C, V, X, Z (Select All, Copy, Paste, Cut, Undo)
            if (isCtrlOrMeta && ['a', 'c', 'v', 'x', 'z'].includes(key.toLowerCase())) {
                return;
            }

            // Allow: Function keys (F1-F12) - less common to block
            if (key.startsWith('F') && !isNaN(parseInt(key.substring(1)))) {
                return;
            }
            
            // Prevent default if the key is a single character AND it gets filtered out
            if (key.length === 1 && !isCtrlOrMeta) {
                 const filteredChar = filterFn(key); // Test the character in isolation
                 if (filteredChar !== key) {
                     console.log(`[filter keydown] Preventing key: '${key}'`);
                     event.preventDefault();
                 }
                 // If char is allowed, default behavior adds it, 'input' listener handles the rest
            }
             // If it's not a single character and not explicitly allowed, potentially block? 
             // For now, we primarily focus on filtering single printable characters.
        });
    }

    // 2. Paste Listener (for filtering pasted content)
    if (filterFn && isFilterableInput) {
        addListener(el, 'paste', (event) => {
            console.log('[filter paste] Intercepting paste');
            event.preventDefault(); // Prevent default paste action

            const pastedText = (event.clipboardData || window.clipboardData).getData('text');
            if (!pastedText) return;

            // Filter the text that was pasted
            const filteredPastedText = filterFn(pastedText);

            const start = el.selectionStart;
            const end = el.selectionEnd;
            const originalValue = el.value;

            // Construct the value that *would* result from pasting the filtered text
            const potentialValue = originalValue.slice(0, start) + filteredPastedText + originalValue.slice(end);
            
            // IMPORTANT: Apply the filter again to the *entire potential value*
            // This ensures rules that depend on the whole string (like max length, specific formats) are respected.
            const finalValue = filterFn(potentialValue); 

            el.value = finalValue; // Update element value with the fully filtered result

            // Set cursor position after the inserted filtered text
            // Calculate based on the difference in length between original selection and filtered pasted text
            const finalCursorPos = start + filteredPastedText.length;
            el.selectionStart = el.selectionEnd = finalCursorPos;

            // Trigger model update and validation MANUALLY after paste modification
             nextTick(() => { // Use nextTick ensure DOM update before model/validation
                 updateModel(el);
                 if (props.validationTiming === 'input' || errors[name]) {
                    validateField(el);
                 }
             });
        });
    }

    // 3. Input Listener (for model update and potential validation - NO filtering here)
    addListener(el, 'input', () => {
        // This event fires naturally after allowed keydown or cut/delete operations,
        // and we manually trigger updates after paste.
        // We just need to ensure the model and validation state are synced.
        updateModel(el);
         // Validate on input if configured, or if there's an existing error
        if (props.validationTiming === 'input' || errors[name]) {
            // Use nextTick here as well for consistency and safety after complex interactions
            nextTick(() => {
                 if (errors[name] || props.validationTiming === 'input') { 
                    validateField(el);
                 }
            });
        }
    });

    // 4. Blur Listener (for validation) - unchanged
    if (props.validationTiming !== 'input') {
        addListener(el, 'blur', () => validateField(el));
    }

    // 5. Change Listener (for checkbox/radio/select) - unchanged
    if (['checkbox', 'radio', 'select-one', 'select-multiple'].includes(el.type)) {
         addListener(el, 'change', () => {
            updateModel(el);
            if (props.validationTiming === 'input' || errors[name]) {
                 validateField(el);
            }
        });
    }
  };

  const init = () => {
    formRef.value = rootRef.value.querySelector('form');
    if (!formRef.value) {
      console.error('No <form> element found inside FormVHtml');
      return;
    }
    formRef.value.querySelectorAll('input,select,textarea').forEach(setupInput);
    addListener(formRef.value, 'submit', (e) => {
      e.preventDefault();
      if (validateAll()) emit('form-submit', { ...props.modelValue });
    });
  };

  onMounted(() => nextTick(init));
  onBeforeUnmount(() => listeners.forEach((off) => off()));

  watch(
    () => props.modelValue,
    (val) => {
      if (!formRef.value) return;
      Object.entries(val).forEach(([name, v]) => {
        const el = formRef.value.querySelector(`[name="${name}"]`);
        if (!el) return;
        if (el.type === 'checkbox') el.checked = v;
        else if (el.type !== 'file') el.value = v ?? '';
      });
    },
    { deep: true }
  );

  return { formRef, errors, validateAll };
}