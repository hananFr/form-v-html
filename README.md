# FormVHtml - Vue 3 HTML-Driven Form Validation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A flexible Vue 3 component that simplifies form handling and validation by leveraging standard HTML attributes and integrating seamlessly with popular validation libraries like Zod and Yup.

**Core Idea:** Define your validation rules directly in your HTML using standard attributes (`required`, `minlength`, `type="email"`, etc.) or custom `data-*` attributes. `FormVHtml` automatically picks these up, handles validation logic, manages error states, and integrates with `v-model`.

## Features

*   **HTML-Driven Validation:** Uses native HTML5 attributes (`required`, `minlength`, `maxlength`, `type="email"`) and custom data attributes (`data-regex`, `data-match`) for validation rules.
*   **`v-model` Integration:** Seamless two-way data binding for your form data.
*   **External Validator Support:** Easily integrate Zod, Yup, or custom validation logic.
*   **Flexible Error Handling:** Control error message placement (`above-input`, `below-input`, `parent`) and timing (`blur`, `input`, `submit`).
*   **Customizable Error Appearance:** Style error messages using the `errorClass` prop.
*   **Programmatic Control:** Exposes methods to trigger validation (`validate`), get current errors (`getErrors`), reset errors (`resetErrors`), and set server-side errors (`setErrors`).
*   **Handles Various Input Types:** Correctly extracts values from inputs, textareas, selects, checkboxes, and radio buttons.

## Installation (Example)

```bash
# Using pnpm
pnpm add form-v-html

# Using npm
npm install form-v-html

# Using yarn
yarn add form-v-html
```

*(Note: Replace `form-v-html` with the actual package name if published)*

## Basic Usage

```vue
<template>
  <FormVHtml v-model="formData" @form-submit="onSubmit">
    <form>
      <div class="form-group">
        <label for="email">Email:</label>
        <input 
          id="email" 
          name="email" 
          type="email" 
          required 
          placeholder="your@email.com"
        />
        <!-- Error message will appear here (default: below-input) -->
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input 
          id="password" 
          name="password" 
          type="password" 
          required 
          minlength="6"
        />
      </div>
      
      <button type="submit">Register</button>
    </form>
  </FormVHtml>
</template>

<script setup>
import { ref } from 'vue';
import FormVHtml from 'form-v-html'; // Adjust import path if local

const formData = ref({
  email: '',
  password: '',
});

const onSubmit = (validData) => {
  console.log('Form submitted successfully!', validData);
  // Send data to server...
};
</script>

<style>
.error-message { /* Default error class */
  color: red;
  font-size: 0.8em;
  margin-top: 4px;
}
</style>
```

## Props

| Prop               | Type     | Default         | Description                                                                   |
| ------------------ | -------- | --------------- | ----------------------------------------------------------------------------- |
| `modelValue`       | `Object` | `{}`            | The reactive object holding the form data (used with `v-model`).               |
| `errorPlacement`   | `String` | `'below-input'` | Where to display error messages: `'above-input'`, `'below-input'`, `'parent'`. |
| `validationTiming` | `String` | `'blur'`        | When to trigger validation: `'blur'`, `'input'`, `'submit'`.                   |
| `errorClass`       | `String` | `'error-message'` | CSS class applied to the error message elements.                              |
| `externalValidator`| `Object` | `null`          | Configuration for external validator (e.g., `{ type: 'zod' }`).              |
| `validationSchema` | `Object` | `null`          | The schema object required by the external validator (e.g., a Zod or Yup schema). |

## Built-in Validation Rules

These are automatically detected from standard HTML attributes:

*   `required`: Checks if the field has a value.
*   `minlength="<number>"`: Checks for minimum string length.
*   `maxlength="<number>"`: Checks for maximum string length.
*   `type="email"`: Validates the input value as an email address.
*   `data-match="<otherFieldName>`: Checks if the field's value matches the value of another field (useful for password confirmation).
*   `data-regex="<pattern>`: Validates the value against a custom regular expression pattern.
*   `data-error-message="<message>`: Overrides the default error message for any failed built-in validation on this element.

## Using External Validators

### Zod Example

```vue
<template>
  <FormVHtml 
    v-model="userData"
    :externalValidator="{ type: 'zod' }"
    :validationSchema="userSchema"
    errorClass="my-zod-error"
  >
    <form>
       <input name="name" type="text" />
       <input name="email" type="email" />
       <button type="submit">Submit</button>
    </form>
  </FormVHtml>
</template>

<script setup>
import { ref } from 'vue';
import { z } from 'zod';
import FormVHtml from 'form-v-html';

const userSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email format'),
});

const userData = ref({ name: '', email: '' });
</script>
```

### Yup Example

```vue
<template>
  <FormVHtml 
    v-model="loginData"
    :externalValidator="{ type: 'yup' }"
    :validationSchema="loginSchema"
  >
    <form>
       <input name="username" type="text" />
       <input name="password" type="password" />
       <button type="submit">Login</button>
    </form>
  </FormVHtml>
</template>

<script setup>
import { ref } from 'vue';
import * as yup from 'yup';
import FormVHtml from 'form-v-html';

const loginSchema = yup.object({
  username: yup.string().required('Username required'),
  password: yup.string().min(6, 'Min 6 chars').required(),
});

const loginData = ref({ username: '', password: '' });
</script>
```

## Exposed API Methods

You can access these methods using a template ref on the `<FormVHtml>` component:

```vue
<template>
  <FormVHtml ref="formRef" ... >
    ...
  </FormVHtml>
  <button @click="triggerValidation">Validate Manually</button>
</template>

<script setup>
import { ref } from 'vue';
const formRef = ref(null);

const triggerValidation = () => {
  const isValid = formRef.value?.validate();
  console.log('Is form valid?', isValid);
};
</script>
```

*   **`validate(): boolean`**: Triggers validation for all fields in the form. Returns `true` if valid, `false` otherwise.
*   **`getErrors(): object`**: Returns a reactive object containing the current validation errors, keyed by field name.
*   **`resetErrors(): void`**: Clears all current validation errors (both internal state and DOM elements).
*   **`setErrors(errors: object): void`**: Sets errors programmatically. Useful for displaying errors received from a server. The `errors` object should map field names to error messages (e.g., `{ email: 'Email already taken', password: 'Password is too weak' }`).

## Accessibility (A11y)

While `FormVHtml` manages error display, ensure your form structure is accessible. Consider:
*   Using `<label>` elements correctly associated with their inputs (using `for` and `id`).
*   While `FormVHtml` adds error messages near inputs, manually adding `aria-describedby` to link inputs to their specific error message `div`s (if needed, based on testing with screen readers) can improve the experience.
*   Setting `aria-invalid="true"` on inputs when they have errors (This is not currently handled automatically by `FormVHtml`).

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

MIT
