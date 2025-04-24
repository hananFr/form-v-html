// tests/unit/components/FormVHtml.spec.js

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
// Ensure the path to FormVHtml.vue is correct relative to this spec file
import FormVHtml from '../../../src/components/FormVHtml.vue';

// Mock the composable it uses
// This isolates the component test from the composable's internal logic
const mockUseForm = {
  formRef: { value: null }, // Mock ref, will be assigned the component's root element
  errors: {},               // Mock reactive errors state
  validateAll: vi.fn(() => true), // Mock function, default to success
  // Add other functions/refs returned by useForm if the component template *directly* uses them
};

// Mock the composable module
vi.mock('../../../src/composables/useForm', () => ({
  useForm: vi.fn(() => mockUseForm),
}));

describe('FormVHtml.vue', () => {

  beforeEach(() => {
      // Reset mocks before each test run
      vi.clearAllMocks();
      mockUseForm.validateAll.mockImplementation(() => true); // Reset mock implementation
      mockUseForm.errors = {}; // Reset mocked state
      // Provide a mock root element for the composable mock to reference initially
      // This will be replaced by the actual component element when useForm is called
      mockUseForm.formRef = { value: document.createElement('div') };
  });

  it('renders the default slot content', () => {
    const wrapper = mount(FormVHtml, {
      slots: {
        // Provide simple form structure for the slot
        default: '<form><input name="testSlotInput" /></form>',
      },
    });
    // Check if the content passed via the slot is rendered
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input[name="testSlotInput"]').exists()).toBe(true);
  });

  it('calls useForm composable on setup with correct arguments', async () => { // Make test async
    // Import the composable *after* vi.mock has been set up
    const { useForm } = await import('../../../src/composables/useForm');
    const wrapper = mount(FormVHtml);

    // Check if the composable was called
    expect(useForm).toHaveBeenCalledTimes(1);

    // Check the arguments passed to useForm
    expect(useForm).toHaveBeenCalledWith(
       expect.objectContaining(wrapper.props()), // 1st arg: Component props
       expect.any(Function), // 2nd arg: Emit function
       // 3rd arg: Ref containing the component's root element
       // wrapper.element refers to the root DOM node of the mounted component
       expect.objectContaining({ value: wrapper.element })
     );
  });

   it('passes props down to useForm composable', async () => { // Make test async
     // Import the composable *after* vi.mock
     const { useForm } = await import('../../../src/composables/useForm');
     const propsData = {
       modelValue: { testProp: 'value123' },
       errorPlacement: 'above-input',
       errorClass: 'custom-error-class',
       errorTemplate: '! ',
       validationTiming: 'input'
     };
     const wrapper = mount(FormVHtml, { props: propsData });

     // Check that useForm was called with the specific props passed to the component
     expect(useForm).toHaveBeenCalledWith(
       expect.objectContaining(propsData), // Check props specifically
       expect.any(Function),               // Emit function
       expect.objectContaining({ value: wrapper.element }) // Root element ref
     );
   });

  it('renders correctly with basic structure (e.g., root element is DIV)', () => {
      const wrapper = mount(FormVHtml);
      // Basic check on the component's root element tag
      expect(wrapper.element.tagName).toBe('DIV');
  });

  // Add more tests if FormVHtml component has features beyond just calling useForm
  // and rendering the slot. For example, if it had its own computed properties,
  // methods, watchers, or specific conditional rendering logic.

});