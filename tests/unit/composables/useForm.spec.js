// tests/useForm.spec.js
// Vitest + Vue Test Utils unit tests for the composable `useForm`
// run with:  npx vitest run
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref, nextTick } from 'vue';
import { useForm } from '../../../src/composables/useForm';

// Mock validation rules for predictable behavior
vi.mock('../../../src/utils/validationRules', () => ({
  validateRules: {
    required: vi.fn((val, _p, msg) => (!val ? msg.required : null)),
    email: vi.fn((val, _p, msg) => (val && !val.includes('@') ? msg.email : null)),
    // Add mocks for other rules if needed by tests
  },
  defaultMessages: {
    required: 'שדה חובה', // Use actual messages if logic depends on them
    email: 'אימייל לא תקין',
    min: v => `min ${v}`,
    max: v => `max ${v}`,
    regex: 'invalid format',
    match: target => `match ${target}`,
  },
}));

/**
 * Test helper – wraps a <form> with two inputs.
 * Props are forwarded to the composable.
 * Uses the real emit from the component.
 */
function buildWrapper(props = {}) {
  const model = ref({ fullName: '', email: '' });
  const TestComp = defineComponent({
    // Define props explicitly for clarity
    props: { 
        modelValue: Object, 
        errorPlacement: String, 
        validationTiming: String, 
        errorClass: String,
        errorTemplate: String
        // Add other props useForm might expect
    },
    emits: ['update:modelValue', 'validation-errors', 'form-submit'], // Declare emitted events
    setup(componentProps, { emit }) { // Use componentProps here
      const rootRef = ref(null);
      // Pass the real emit function from setup context
      const { validateAll, errors } = useForm(
        // Pass componentProps which includes defaults + overrides
        componentProps, 
        emit, // <-- Pass the actual emit function
        rootRef,
      );
      
      // Expose validateAll if needed by tests (optional)
      // expose({ validateAll }); 

      return () =>
        h('div', { ref: rootRef }, [
          h(
            'form',
            { 
              // Prevent actual form submission during tests
              onSubmit: (e) => {
                 e.preventDefault();
                 // Manually call validateAll if needed, like in a real submit handler
                 // validateAll(); 
              } 
            },
            [
              h('input', {
                name: 'fullName',
                'data-label': 'שם מלא', // Use data-label for auto label generation test
                required: true,
                value: model.value.fullName,
                // Simulate v-model update behavior
                onInput: (e) => {
                  model.value.fullName = e.target.value;
                  // Manually emit update:modelValue for testing v-model binding
                  emit('update:modelValue', { ...model.value }); 
                },
                 onBlur: (e) => { /* Allow blur event */ }
              }),
              h('input', {
                name: 'email',
                type: 'email',
                'data-label': 'אימייל',
                value: model.value.email,
                onInput: (e) => {
                    model.value.email = e.target.value;
                    emit('update:modelValue', { ...model.value });
                },
                onBlur: (e) => { /* Allow blur event */ }
              }),
              h('button', { type: 'submit' }, 'Submit'),
            ],
          ),
        ]);
    },
  });

  // Define default props here
  const defaultProps = {
      modelValue: model.value, // Pass reactive model here
      errorPlacement: 'below-input', // Default to DOM placement for easier testing
      validationTiming: 'blur',
      errorClass: 'err',
      errorTemplate: '* ',
  };

  // Mount with merged props (defaults + overrides)
  const wrapper = mount(TestComp, { 
      props: { ...defaultProps, ...props } 
  });
  
  // Need to wait for component mount and useForm's onMounted/nextTick
  // await wrapper.vm.$nextTick(); // Use wrapper's nextTick
  // Sometimes multiple ticks or fake timers are needed for async operations in setup/onMounted
  vi.runAllTimers(); // Advance fake timers if useForm uses setTimeout/Interval

  return { wrapper, model }; // No longer returning 'events' object
}

/* ------------------------------------------------------------------ */
describe('useForm composable', () => {
  beforeEach(() => {
      vi.useFakeTimers(); // Use fake timers for async operations like nextTick
      vi.clearAllMocks(); // Clear mocks from validationRules etc.
  });

  afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers(); // Restore real timers after each test
  });
  
  it('validates required on blur and displays error in DOM', async () => {
    // Use default errorPlacement ('below-input' in buildWrapper defaults)
    const { wrapper } = buildWrapper(); 
    const input = wrapper.find('input[name="fullName"]');
    
    await input.setValue(''); // Ensure it's empty
    await input.trigger('blur');
    await nextTick(); // Wait for validation and DOM updates
    
    // error div should be rendered with default placement
    const err = wrapper.find('[data-error-for="fullName"]'); // More specific selector
    expect(err.exists()).toBe(true);
    // Check text content, assuming defaultMessages is mocked correctly
    expect(err.text()).toContain('שדה חובה'); 
  });

  it('emits validation-errors on blur when errorPlacement="export"', async () => {
    // Pass errorPlacement explicitly
    const { wrapper } = buildWrapper({ errorPlacement: 'export' }); 
    const input = wrapper.find('input[name="fullName"]');
    
    await input.setValue(''); // Ensure empty
    await input.trigger('blur');
    await nextTick(); // Allow validation and emit to occur
    
    // Check emitted events using wrapper.emitted()
    const emittedEvents = wrapper.emitted();
    expect(emittedEvents).toHaveProperty('validation-errors'); // Check if event was emitted
    expect(emittedEvents['validation-errors'][0][0]).toMatchObject({ fullName: 'שדה חובה' }); // Check payload
    
    // Ensure no DOM error element was created
    const err = wrapper.find('[data-error-for="fullName"]');
    expect(err.exists()).toBe(false); 
  });

  it('updates modelValue on input', async () => {
    const { wrapper } = buildWrapper({ validationTiming: 'input' }); // Ensure validation runs on input for test simplicity if needed
    const input = wrapper.find('input[name="fullName"]');
    
    await input.setValue('Alice'); // setValue triggers input event and updates model via onInput handler
    await nextTick(); // Allow update and emit to occur

    const emittedEvents = wrapper.emitted(); 
    expect(emittedEvents).toHaveProperty('update:modelValue');
    // Check the last emitted value if multiple inputs occurred
    const lastEmit = emittedEvents['update:modelValue'].pop()[0]; 
    expect(lastEmit).toMatchObject({ fullName: 'Alice' });
  });

  it('emits form-submit only when all fields valid', async () => {
    const { wrapper, model } = buildWrapper(); // errorPlacement defaults to below-input
    const nameInput = wrapper.find('input[name="fullName"]');
    const emailInput = wrapper.find('input[name="email"]');

    await nameInput.setValue('Bob');
    await emailInput.setValue('notanemail'); // Invalid email initially
    
    // Trigger validation manually or via submit (if validateAll is called on submit)
    // Since useForm's submit handler calls validateAll, triggering submit is okay.
    await wrapper.find('form').trigger('submit');
    await nextTick(); // Allow validation and potential emit

    let emittedEvents = wrapper.emitted();
    expect(emittedEvents['form-submit']).toBeUndefined(); // invalid email, should not submit

    // Correct the email and submit again
    await emailInput.setValue('bob@mail.com');
    await wrapper.find('form').trigger('submit');
    await nextTick(); // Allow validation and emit

    emittedEvents = wrapper.emitted(); // Check again after valid submission
    expect(emittedEvents).toHaveProperty('form-submit');
    // Check the payload of the first (and only expected) form-submit event
    expect(emittedEvents['form-submit'][0][0]).toMatchObject({ fullName: 'Bob', email: 'bob@mail.com' });
  });

  // Removed the duplicate test 'emits validation-errors when errorPlacement="export"'
});
