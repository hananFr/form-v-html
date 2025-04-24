// Define functions to handle required validation based on value type
const handlingTypes = {
    // Allow 0 for numbers, check explicitly for null/undefined/NaN
    number: (val, msg) => (val === null || val === undefined || isNaN(val) ? msg.required : null),
    string: (val, msg) => (val ? null : msg.required),
    array: (val, msg) => (val && val.length ? null : msg.required),
    object: (val, msg) => (val && Object.keys(val).length ? null : msg.required),
    // Allow false for booleans, check explicitly for null/undefined
    boolean: (val, msg) => (val === null || val === undefined ? msg.required : null),
    // Default or fallback if type is unexpected (treats falsy as error)
    default: (val, msg) => (val ? null : msg.required)
};

// Default error messages
export const defaultMessages = {
  required: 'שדה חובה', // Use actual message for consistency
  min: v => `min ${v}`,
  max: v => `max ${v}`,
  email: 'אימייל לא תקין',
  regex: 'invalid format',
  match: target => `match ${target}`,
};

// Validation rule functions
export const validateRules = {
  // Pass the 'msg' object to the appropriate handlingType function
  required: (val, _param, msg) => {
    const type = typeof val;
    // Use boolean handler specifically
    const handler = type === 'boolean' ? handlingTypes.boolean : (handlingTypes[type] || handlingTypes.default);
    // Use the handler function, passing both value and messages
    return handler(val, msg);
  },
  min: (val, p, msg) => (val && val.length < p ? msg.min(p) : null),
  max: (val, p, msg) => (val && val.length > p ? msg.max(p) : null),
  email: (val, _p, msg) => (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? msg.email : null),
  regex: (val, pattern, msg) => (val && !new RegExp(pattern).test(val) ? msg.regex : null),
  // Note: The 'match' rule expects the value to match, not the target field name for the message.
  // Consider if you need the form model here to get the value of the other field.
  // Currently passing targetName (likely the *name* of the field to match, not its value) to msg.match
  match: (val, targetName, msg, /* Needs implementation */ ) => {
     return null; // Temporarily disable match or implement correctly
  },
};