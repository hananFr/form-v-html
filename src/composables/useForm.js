import { reactive, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { getInputValue } from '../utils/valueExtractors';
import { validateRules, defaultMessages } from '../utils/validationRules';

export function useForm(props, emit, rootRef) {
  const formRef = ref(null);
  const errors = reactive({});
  const listeners = [];

  const addListener = (el, evt, fn) => {
    el.addEventListener(evt, fn);
    listeners.push(() => el.removeEventListener(evt, fn));
  };

  
  const wrapWithGroupAndLabel = (el) => {
    // Don't handle if not an element or already wrapped
    if (el.nodeType !== 1) return;
    if (el.parentElement && el.parentElement.classList.contains('form-group')) return;

    // Get label text from directive or attributes
    let lblText = el._vLabel || el.getAttribute('data-label') || el.getAttribute('label');
    if (!lblText) return; // No label text found, do nothing

    const name = el.name || '';
    const originalParent = el.parentNode; // Get parent BEFORE moving the element

    // Cannot wrap if element is not currently in the DOM
    if (!originalParent) return;

    // Avoid double-wrapping based on previous sibling label (basic check)
    if (el.previousElementSibling && el.previousElementSibling.tagName === 'LABEL' && 
        el.parentElement === originalParent) { 
         // Potentially skip or warn if a label already exists directly before
         // return; // Uncomment to skip if label found
    }

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
    //    Appending 'el' here moves it from its original parent into the wrapper
    wrapper.appendChild(labelEl);
    wrapper.appendChild(el);

    // 5. Insert the wrapper into the original parent where 'el' used to be
    //    Use insertBefore with the nextSibling reference we saved.
    //    If nextSibling is null, insertBefore acts like appendChild.
    originalParent.insertBefore(wrapper, nextSibling);

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
    wrapWithGroupAndLabel(el); // <-- new feature

    const { name } = el;
    if (!name) return;
    if (props.validationTiming !== 'input') {
      addListener(el, 'blur', () => validateField(el));
    }
    const evt = el.type === 'checkbox' || el.type === 'radio' ? 'change' : 'input';
    addListener(el, evt, () => {
      updateModel(el);
      if (props.validationTiming === 'input' || errors[name]) validateField(el);
    });
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