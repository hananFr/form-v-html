// tests/unit/utils/validationRules.spec.js

import { describe, it, expect } from 'vitest';
// Adjust path as needed
import { validateRules, defaultMessages } from '../../../src/utils/validationRules'; 

describe('validationRules.js', () => {
  
  // Use the actual default messages for realistic testing
  const messages = defaultMessages; 

  describe('required rule', () => {
    const rule = validateRules.required;

    it('should return error message for empty string', () => {
      expect(rule('', null, messages)).toBe(messages.required);
    });

    it('should return error message for null', () => {
      expect(rule(null, null, messages)).toBe(messages.required);
    });

    it('should return error message for undefined', () => {
      expect(rule(undefined, null, messages)).toBe(messages.required);
    });
    
    it('should return error message for empty array', () => {
      expect(rule([], null, messages)).toBe(messages.required);
    });
    
    // Handling for numbers (0 is often considered non-empty in required context)
    it('should return null for number 0', () => {
       expect(rule(0, null, messages)).toBeNull(); 
    });
     it('should return error message for NaN', () => {
       // typeof NaN is 'number', so it might currently pass if it relies on falsiness
       // Adjust required logic or test based on desired behavior for NaN
       expect(rule(NaN, null, messages)).toBe(messages.required); // Assuming NaN is required error
     });

    it('should return null for non-empty string', () => {
      expect(rule('hello', null, messages)).toBeNull();
    });

    it('should return null for non-empty array', () => {
      expect(rule(['a'], null, messages)).toBeNull();
    });
    
     it('should return null for boolean true', () => {
       expect(rule(true, null, messages)).toBeNull();
     });
     
     it('should return null for boolean false', () => {
        // typeof false is 'boolean', need handler if not covered by 'default'
        // Current default handler treats false as "not empty" (because it's not null/undefined)
       expect(rule(false, null, messages)).toBeNull(); 
     });
     
     it('should return null for non-empty object', () => {
        expect(rule({a: 1}, null, messages)).toBeNull();
     });
     it('should return error for empty object', () => {
        // typeof {} is 'object'
       expect(rule({}, null, messages)).toBe(messages.required);
     });

  });

  describe('min rule (minLength)', () => {
     const rule = validateRules.min;
     const minLength = 5;

     it('should return error if string length is less than min', () => {
        expect(rule('abc', minLength, messages)).toBe(messages.min(minLength));
     });
     it('should return null if string length is equal to min', () => {
        expect(rule('abcde', minLength, messages)).toBeNull();
     });
      it('should return null if string length is greater than min', () => {
        expect(rule('abcdef', minLength, messages)).toBeNull();
     });
      it('should return null if value is empty (required rule handles empty)', () => {
        expect(rule('', minLength, messages)).toBeNull();
        expect(rule(null, minLength, messages)).toBeNull();
     });
      // Add tests for arrays if applicable
  });

  describe('max rule (maxLength)', () => {
      const rule = validateRules.max;
      const maxLength = 5;

      it('should return error if string length is greater than max', () => {
          expect(rule('abcdef', maxLength, messages)).toBe(messages.max(maxLength));
      });
      it('should return null if string length is equal to max', () => {
          expect(rule('abcde', maxLength, messages)).toBeNull();
      });
      it('should return null if string length is less than max', () => {
          expect(rule('abc', maxLength, messages)).toBeNull();
      });
       it('should return null if value is empty', () => {
          expect(rule('', maxLength, messages)).toBeNull();
          expect(rule(null, maxLength, messages)).toBeNull();
       });
       // Add tests for arrays if applicable
  });

  describe('email rule', () => {
     const rule = validateRules.email;

     it('should return error for invalid email format', () => {
         expect(rule('test', null, messages)).toBe(messages.email);
         expect(rule('test@', null, messages)).toBe(messages.email);
         expect(rule('test@domain', null, messages)).toBe(messages.email);
         expect(rule('@domain.com', null, messages)).toBe(messages.email);
         expect(rule('test@domain.', null, messages)).toBe(messages.email);
         expect(rule('test domain@domain.com', null, messages)).toBe(messages.email);
     });
      it('should return null for valid email format', () => {
          expect(rule('test@domain.com', null, messages)).toBeNull();
          expect(rule('test.name@domain.co.uk', null, messages)).toBeNull();
          expect(rule('test+alias@domain-name.com', null, messages)).toBeNull();
      });
       it('should return null if value is empty', () => {
           expect(rule('', null, messages)).toBeNull();
           expect(rule(null, null, messages)).toBeNull();
       });
  });

  describe('regex rule', () => {
      const rule = validateRules.regex;
      const pattern = '^[a-zA-Z]+$'; // Example: only letters

       it('should return error if value does not match regex', () => {
           expect(rule('abc1', pattern, messages)).toBe(messages.regex);
           expect(rule('abc def', pattern, messages)).toBe(messages.regex);
       });
        it('should return null if value matches regex', () => {
            expect(rule('abc', pattern, messages)).toBeNull();
            expect(rule('ABC', pattern, messages)).toBeNull();
        });
         it('should return null if value is empty', () => {
             expect(rule('', pattern, messages)).toBeNull();
             expect(rule(null, pattern, messages)).toBeNull();
         });
          it('should handle complex regex patterns', () => {
             const complexPattern = '^\\d{3}-\\d{3}$'; // e.g., 123-456
             expect(rule('123-456', complexPattern, messages)).toBeNull();
             expect(rule('12-3456', complexPattern, messages)).toBe(messages.regex);
          });
  });

  // Add tests for 'match' rule once its implementation is complete
  // describe('match rule', () => { ... });

});