export const filtersRules = {
  phone: (val) => {
    // Allow only digits
    if (typeof val !== 'string') return '';
    return val.replace(/[^0-9 -]/g, '');
  },
  number: (val) => {
    // Allow only digits
    if (typeof val !== 'string') return '';
    return val.replace(/[^0-9]/g, '');
  },
  email: (val) => {
    // Allow characters potentially valid in an email address
    if (typeof val !== 'string') return '';
    // Allows letters, numbers, and the characters . _ % + - @
    return val.replace(/[^a-zA-Z0-9._%+-@]/g, '');
  },
  includeInList: (val, list) => {
    return list.some(item => item.toLowerCase() === val.toLowerCase());
    },
  regex: (val, regex) => {
    return val.match(regex) ? val : '';
  },
};


