<template>
    <div class="form-v-html" ref="rootRef">
        <slot />
    </div>
</template>

<script setup>
import {
    defineProps,
    defineEmits,
    defineExpose,
    ref,
} from 'vue';
import { useForm } from '../composables/useForm';

const props = defineProps({
    modelValue: { type: Object, default: () => ({}) },
    errorPlacement: { type: String, default: 'below-input' },  // 'above-input' | 'below-input' | 'parent' | 'export'
    validationTiming: { type: String, default: 'blur' },       // 'blur' | 'input' | 'submit'
    errorClass: { type: String, default: 'error-message' },
    errorTemplate: { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue', 'form-submit', 'validation-errors']);

const rootRef = ref(null);
const { validateAll, errors } = useForm(props, emit, rootRef);

/* expose API to parent */
defineExpose({
    validate: validateAll,
    getErrors: () => ({ ...errors }),
});

</script>