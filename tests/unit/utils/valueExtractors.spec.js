// tests/unit/utils/valueExtractors.spec.js

import { describe, it, expect } from 'vitest';
// Adjust path as needed
import { getInputValue } from '../../../src/utils/valueExtractors'; 

describe('valueExtractors.js', () => {
  
  describe('getInputValue', () => {
    
    it('should get value from text input', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = 'hello';
      expect(getInputValue(input)).toBe('hello');
    });

    it('should get value from textarea', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'world';
      expect(getInputValue(textarea)).toBe('world');
    });

    it('should get value from select', () => {
      const select = document.createElement('select');
      const option1 = document.createElement('option');
      option1.value = 'val1';
      option1.text = 'Opt1';
      const option2 = document.createElement('option');
      option2.value = 'val2';
      option2.text = 'Opt2';
      select.appendChild(option1);
      select.appendChild(option2);
      select.value = 'val2'; // Set selected value
      expect(getInputValue(select)).toBe('val2');
    });

    it('should get value from checked radio button in a group', () => {
      const form = document.createElement('form');
      const radio1 = document.createElement('input');
      radio1.type = 'radio';
      radio1.name = 'group1';
      radio1.value = 'r1';
      const radio2 = document.createElement('input');
      radio2.type = 'radio';
      radio2.name = 'group1';
      radio2.value = 'r2';
      radio2.checked = true; // This one is checked
      const radio3 = document.createElement('input');
      radio3.type = 'radio';
      radio3.name = 'group1';
      radio3.value = 'r3';
      form.appendChild(radio1);
      form.appendChild(radio2);
      form.appendChild(radio3);
      // Pass the form reference if the function uses it to find checked radio
      // If it expects the radio itself, the logic needs adjustment
      expect(getInputValue(radio2, form)).toBe('r2'); 
      // Test that calling on unchecked returns the checked value
      expect(getInputValue(radio1, form)).toBe('r2'); 
    });
    
    it('should return true/false for single checkbox', () => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        expect(getInputValue(checkbox)).toBe(true);
        checkbox.checked = false;
        expect(getInputValue(checkbox)).toBe(false);
    });

    it('should return array of values for checkboxes with same name', () => {
        const form = document.createElement('form');
        const cb1 = document.createElement('input');
        cb1.type = 'checkbox';
        cb1.name = 'group2[]'; // common practice naming convention
        cb1.value = 'c1';
        cb1.checked = true;
        const cb2 = document.createElement('input');
        cb2.type = 'checkbox';
        cb2.name = 'group2[]';
        cb2.value = 'c2';
        cb2.checked = false;
        const cb3 = document.createElement('input');
        cb3.type = 'checkbox';
        cb3.name = 'group2[]';
        cb3.value = 'c3';
        cb3.checked = true;
        form.appendChild(cb1);
        form.appendChild(cb2);
        form.appendChild(cb3);
        // Expecting an array of values from the checked boxes in the group
        // Pass one of the checkboxes and the form
        expect(getInputValue(cb1, form)).toEqual(['c1', 'c3']);
        // Should return the same when called on another checkbox in the group
        expect(getInputValue(cb2, form)).toEqual(['c1', 'c3']);
    });

    it('should return null for file input (or FileList)', () => {
      // File input value is read-only and complex to mock directly
      // Test that it doesn't return the path, maybe null or FileList
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      // Usually, you test file handling logic separately
      expect(getInputValue(fileInput)).toBeNull(); // Or potentially expect(getInputValue(fileInput)).toBeInstanceOf(FileList);
    });

     it('should return empty string for empty text input', () => {
       const input = document.createElement('input');
       input.type = 'text';
       input.value = '';
       expect(getInputValue(input)).toBe('');
     });
     
     it('should return empty string for select with no selection and empty value option', () => {
       const select = document.createElement('select');
       const option1 = document.createElement('option');
       option1.value = ''; // Empty value option
       option1.text = 'Select...';
       select.appendChild(option1);
       select.value = ''; 
       expect(getInputValue(select)).toBe('');
     });

  });
});