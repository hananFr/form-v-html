import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import autoLabelDirective from '../../../src/directives/autoLabel';

describe('autoLabel directive', () => {
  // Helper function to mount a component with the directive applied
  const mountWithDirective = (directiveValue, tag = 'input', attrs = {}) => {
    // Create a div wrapper to properly test parent element modifications
    const TestComponent = defineComponent({
      props: { labelValue: null },
      template: `
        <div>
          <${tag} v-auto-label="labelValue" name="test-field" ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')} />
        </div>
      `,
    });

    return mount(TestComponent, {
      props: { labelValue: directiveValue },
      global: {
        directives: {
          AutoLabel: autoLabelDirective
        }
      }
    });
  };

  it('should create a label element before the input', async () => {
    const labelText = 'My Real Label';
    const wrapper = mountWithDirective(labelText);
    
    await nextTick();
    
    // Check if a label element was created
    const label = wrapper.find('label');
    expect(label.exists()).toBe(true);
    expect(label.text()).toBe(labelText);
  });

  it('should set the "for" attribute on the label to match the input name', async () => {
    const labelText = 'Input Label';
    const wrapper = mountWithDirective(labelText);
    
    await nextTick();
    
    const label = wrapper.find('label');
    expect(label.attributes('for')).toBe('test-field');
  });

  it('should add form-group class to the parent element', async () => {
    const labelText = 'Form Group Test';
    const wrapper = mountWithDirective(labelText);
    
    await nextTick();
    
    // Check if the parent div has the form-group class
    expect(wrapper.element.classList.contains('form-group')).toBe(true);
  });

  it('should add form-group-{name} class to the parent element', async () => {
    const labelText = 'Named Form Group';
    const wrapper = mountWithDirective(labelText);
    
    await nextTick();
    
    // Check if the parent div has the form-group-test-field class
    expect(wrapper.element.classList.contains('form-group-test-field')).toBe(true);
  });
  
  it('should work with different element types like select', async () => {
    const labelText = 'Select Test Label';
    const wrapper = mountWithDirective(labelText, 'select');
    
    await nextTick();
    
    const label = wrapper.find('label');
    expect(label.exists()).toBe(true);
    expect(label.text()).toBe(labelText);
  });
  
  it('should not create a label if value is empty', async () => {
    const wrapper = mountWithDirective('');
    
    await nextTick();
    
    const label = wrapper.find('label');
    expect(label.exists()).toBe(false);
  });

  it('should handle updates to the directive value', async () => {
    const TestComponent = defineComponent({
      props: ['labelValue'],
      template: `
        <div>
          <input v-auto-label="labelValue" name="test-field" />
        </div>
      `,
    });
    
    const wrapper = mount(TestComponent, {
      props: { labelValue: 'Initial' },
      global: { directives: { AutoLabel: autoLabelDirective } }
    });
    
    await nextTick();
    let label = wrapper.find('label');
    expect(label.text()).toBe('Initial');
    
    // Update the prop
    await wrapper.setProps({ labelValue: 'Updated' });
    
    // Note: The test might fail here because your directive doesn't have an 'update' hook
    // It only has 'mounted' which runs once when the element is inserted into the DOM
    
    // This will only work if your directive properly handles updates
    await nextTick();
    label = wrapper.find('label');
    expect(label.text()).toBe('Updated');
  });
});