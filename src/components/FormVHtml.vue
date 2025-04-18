<template>
    <div class="form-v-html" ref="rootRef">
        <slot></slot>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, defineProps, defineEmits, nextTick } from 'vue';

const props = defineProps({
    modelValue: { type: Object, default: () => ({}) },
    errorPlacement: { type: String, default: 'below-input' }, // 'above-input', 'below-input', 'parent'
    validationTiming: { type: String, default: 'blur' }, // 'blur', 'input', 'submit'
    errorClass: { type: String, default: 'error-message' },
    patterns: { type: Object, default: () => ({}) },
    // Add external validator support
    externalValidator: { type: Object, default: null },
    validationSchema: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'form-submit', 'validation-errors']);

const rootRef = ref(null);
const formRef = ref(null);
const formErrors = ref({});

// Define value extractors for different input types
const valueExtractors = {
    checkbox: (el) => el.checked,
    radio: (el, name, formRef) => {
        const checkedRadio = formRef.querySelector(`input[name="${name}"]:checked`);
        return checkedRadio ? checkedRadio.value : '';
    },
    // Default extractor for most input types
    default: (el) => el.value
};

// Get input value using the appropriate extractor
const getInputValue = (el, name) => {
    const extractor = valueExtractors[el.type] || valueExtractors.default;
    return extractor(el, name, formRef.value);
};

const updateModel = (el) => {
    const name = el.name;
    if (!name) return;

    const value = getInputValue(el, name);

    emit('update:modelValue', { ...props.modelValue, [name]: value });

    // Validate on input if specified
    if (props.validationTiming === 'input') {
        validateField(el);
    }
};

const validateRules = {
    required: (value, _, el) => !value || (Array.isArray(value) && !value.length) ? 'שדה חובה' : null,
    min: (value, param) => value && value.length < param ? `אורך מינימלי הוא ${param}` : null,
    max: (value, param) => value && value.length > param ? `אורך מקסימלי הוא ${param}` : null,
    email: (value) => value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'אימייל לא תקין' : null,
    regex: (value, pattern) => value && !new RegExp(pattern).test(value) ? 'הערך אינו בפורמט הנדרש' : null,
    match: (value, param, el) => {
        const matchEl = formRef.value.querySelector(`[name="${param}"]`);
        // Correctly use the TARGET element's placeholder if available, fallback to name
        const matchTargetName = matchEl?.getAttribute('placeholder') || param;
        return matchEl && value !== matchEl.value ? `השדה אינו תואם ל-${matchTargetName}` : null;
    }
};

const parseValidations = (el) => {
    const validations = [];

    // Mapping of HTML attributes to validation types
    const htmlValidationMap = {
        'required': ['required', true],
        'minlength': ['min', (el) => el.getAttribute('minlength')],
        'maxlength': ['max', (el) => el.getAttribute('maxlength')],
    };

    // Add type-specific validations
    const typeValidationMap = {
        'email': ['email', true]
    };

    // Data attribute validations
    const dataValidationMap = {
        'regex': ['regex', (el) => el.dataset.regex],
        'match': ['match', (el) => el.dataset.match]
    };

    // Process HTML5 validations
    Object.keys(htmlValidationMap).forEach(attr => {
        if (el.hasAttribute(attr)) {
            const [validationType, valueOrFn] = htmlValidationMap[attr];
            const value = typeof valueOrFn === 'function' ? valueOrFn(el) : valueOrFn;
            validations.push([validationType, value]);
        }
    });

    // Process type-specific validations
    if (typeValidationMap[el.type]) {
        const [validationType, value] = typeValidationMap[el.type];
        validations.push([validationType, value]);
    }

    // Process data attribute validations
    Object.keys(dataValidationMap).forEach(attr => {
        if (attr in el.dataset) {
            const [validationType, valueOrFn] = dataValidationMap[attr];
            const value = typeof valueOrFn === 'function' ? valueOrFn(el) : valueOrFn;
            validations.push([validationType, value]);
        }
    });

    return validations;
};

const validateField = (el) => {
    const name = el.name;
    if (!name) return true;

    const value = getInputValue(el, name);

    // Check for external validation first
    if (props.externalValidator && props.validationSchema) {
        const error = runExternalValidation(name, value);
        handleError(el, error);
        return !error;
    }

    // Get validations for this field
    const validations = parseValidations(el);
    let error = null;

    // Run each validation rule until an error is found
    for (const [rule, param] of validations) {
        const validateFn = validateRules[rule];
        if (validateFn) {
            error = validateFn(value, param, el);
            if (error) break;
        }
    }

    // Custom validation message if provided
    if (error && el.dataset.errorMessage) {
        error = el.dataset.errorMessage;
    }

    // Handle error based on placement
    handleError(el, error);

    return !error;
};

const handleError = (el, error) => {
    const name = el.name;
    if (!name) return;
    const hadErrorBefore = !!formErrors.value[name]; // Check state *before* removeError

    removeError(el); // Clears from formErrors.value

    if (error) {
        formErrors.value[name] = error;
        if (props.errorPlacement === 'parent') {
            emit('validation-errors', { ...formErrors.value }); // Emit on adding/updating error
        } else {
            // Create and insert error element
            const position = props.errorPlacement === 'above-input' ? 'beforebegin' : 'afterend';
            const errorEl = document.createElement('div');
            errorEl.dataset.errorFor = name;
            errorEl.className = props.errorClass;
            errorEl.textContent = error;
            el.insertAdjacentElement(position, errorEl);
        }
    } else {
        // Error is null or empty - we only need to emit if an error was actually cleared
        if (props.errorPlacement === 'parent' && hadErrorBefore) {
            // Only emit if the state *changed* (an error was actually removed)
            emit('validation-errors', { ...formErrors.value }); // Emit on clearing error
        }
    }
};

const validateAllFields = () => {
    let isValid = true;

    if (formRef.value) {
        const inputs = formRef.value.querySelectorAll('input, select, textarea');
        inputs.forEach(el => {
            if (!validateField(el)) {
                isValid = false;
            }
        });
    }

    return isValid;
};

const removeError = (el) => {
    const name = el.name;
    delete formErrors.value[name];

    if (props.errorPlacement !== 'parent') {
        // Only remove the DOM element if placement is not parent
        const errorEl = document.querySelector(`[data-error-for="${name}"]`);
        if (errorEl) errorEl.remove();
    }
    // Do not emit validation-errors from here when placement is parent,
    // as handleError will emit it after the state is fully updated.
    /* else {
        emit('validation-errors', { ...formErrors.value });
    } */
};

const findForm = () => {
    formRef.value = rootRef.value.querySelector('form');
    if (!formRef.value) console.error('No form element found within FormVHtml component');
    return !!formRef.value;
};

const setupForm = () => {
    const inputs = formRef.value.querySelectorAll('input, select, textarea');
    inputs.forEach(setupInput);

    // Add form submit handler
    formRef.value.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateAllFields()) {
            emit('form-submit', { ...props.modelValue });
        }
    });
};

const initialize = () => {
    nextTick(() => {
        if (findForm()) {
            setupForm();
        }
    });
};

onMounted(initialize);

watch(() => props.modelValue, () => {
    if (formRef.value) {
        Object.entries(props.modelValue).forEach(([name, value]) => {
            const el = formRef.value.querySelector(`[name="${name}"]`);
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = value;
                } else if (el.type !== 'file') {
                    el.value = value || '';
                }
            }
        });
    }
}, { deep: true });

// Expose API for parent component
defineExpose({
    validate: validateAllFields,
    getErrors: () => ({ ...formErrors.value }),
    resetErrors: () => {
        Object.keys(formErrors.value).forEach(name => {
            const el = formRef.value?.querySelector(`[name="${name}"]`);
            if (el) removeError(el);
        });
        formErrors.value = {};
    },
    setErrors: (serverErrors) => {
        if (!formRef.value) return; // Need the form reference

        // First, reset all current client/server errors
        // This ensures fields not in serverErrors are cleared
        Object.keys(formErrors.value).forEach(name => {
            const el = formRef.value?.querySelector(`[name="${name}"]`);
            if (el) removeError(el); // Use removeError to handle DOM cleanup if needed
        });
        formErrors.value = {}; // Ensure internal state is clean
        if (props.errorPlacement === 'parent') {
            emit('validation-errors', {}); // Emit empty state after clearing if parent
        }

        // Now, apply the new errors provided
        if (!serverErrors || Object.keys(serverErrors).length === 0) return; // Nothing more to do if no errors passed

        Object.entries(serverErrors).forEach(([fieldName, errorMessage]) => {
            const el = formRef.value.querySelector(`[name="${fieldName}"]`);
            if (el && errorMessage) {
                // Use handleError to display the error and update internal state
                handleError(el, errorMessage);
            }
            // No need for the else-if part, as we cleared all errors initially
        });
    }
});

// Setup an individual input
const setupInput = (el) => {
    const name = el.name; // Get name for use in listeners

    // Attach blur listener for validation if timing is not 'input'
    // This ensures validation runs on blur for 'blur' and 'submit' timings.
    if (props.validationTiming !== 'input') {
        el.addEventListener('blur', () => validateField(el));
    }

    // Handle input changes
    el.addEventListener('input', () => {
        // Always update the model value first
        updateModel(el); // This might call validateField if timing is 'input'

        // *Additionally*, if an error currently exists for this field,
        // re-validate immediately on input to clear the error if the input becomes valid.
        // This clearing behavior should happen regardless of validationTiming.
        if (name && formErrors.value[name]) {
            validateField(el);
        }
    });
};

// Handle external validation libraries
const runExternalValidation = (fieldName, value) => {
    // Skip validation if no schema is defined for this field
    if (!props.validationSchema || !props.externalValidator) return '';

    try {
        // External validators map for popular libraries
        const validators = {
            // Yup implementation
            yup: () => {
                try {
                    // Create an object with the current field value
                    const testObject = { [fieldName]: value };

                    // Run validation only on the specific field
                    props.validationSchema.validateSyncAt(fieldName, testObject);
                    return ''; // No error
                } catch (err) {
                    // Return the error message
                    return err.message || 'Validation error'; // Changed Hebrew to English
                }
            },

            // Zod implementation
            zod: () => {
                // Zod validates the whole object. We need to parse the full modelValue.
                const currentData = { ...props.modelValue, [fieldName]: value };
                const result = props.validationSchema.safeParse(currentData);

                if (!result.success) {
                    // Find the specific error for the current field
                    const fieldError = result.error.issues.find(issue => issue.path.join('.') === fieldName);
                    return fieldError ? fieldError.message : ''; // Return error only if it matches the current field
                }
                return ''; // No error for this field
            },

            // VeeValidate implementation
            veeValidate: () => {
                const fieldRule = props.validationSchema?.[fieldName];
                if (!fieldRule) {
                    return '';
                }
                const validateFn = props.externalValidator?.validate;
                if (typeof validateFn !== 'function') {
                    console.error('VeeValidate integration expects a validate function in externalValidator.validate');
                    return '';
                }
                const result = validateFn(value, fieldRule);
                // Return the error message if it's a string, otherwise empty string for no error.
                return typeof result === 'string' ? result : '';
            },

            // Custom validator implementation
            custom: () => {
                if (typeof props.externalValidator.validate !== 'function') {
                    console.error('External validator must provide a validate function');
                    return '';
                }

                return props.externalValidator.validate(fieldName, value, props.validationSchema);
            }
        };

        // Get validator type from externalValidator
        const validatorType = props.externalValidator.type || 'custom';

        // Call the appropriate validator
        const validatorFn = validators[validatorType] || validators.custom;
        return validatorFn();
    } catch (error) {
        console.error('External validation error:', error);
        return '';
    }
};
</script>