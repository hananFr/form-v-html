# FormVHtml

> A lightweight, intuitive Vue form validation library with seamless RTL support

[![npm version](https://img.shields.io/npm/v/form-vhtml.svg)](https://www.npmjs.com/package/form-vhtml)
[![license](https://img.shields.io/npm/l/form-vhtml.svg)](https://github.com/yourusername/form-vhtml/blob/main/LICENSE)

FormVHtml is a Vue form validation library designed with simplicity and developer experience in mind. It provides automatic label generation, validation based on standard HTML attributes, and full RTL language support.

![FormVHtml Demo](https://via.placeholder.com/800x400?text=FormVHtml+Demo)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Basic Concepts](#basic-concepts)
- [Form Structure](#form-structure)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [RTL Support](#rtl-support)
- [API Reference](#api-reference)
  - [Props](#props)
  - [Events](#events)
  - [Methods](#methods)
  - [Directives](#directives)
- [Styling](#styling)
- [Advanced Usage](#advanced-usage)
- [Examples](#examples)
- [TypeScript Support](#typescript-support)
- [Browser Compatibility](#browser-compatibility)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Zero Configuration** - Works out of the box with sensible defaults
- **Automatic Form Structure** - Automatically wraps inputs with labels and form groups
- **Standard HTML Validation** - Uses familiar HTML5 attributes for validation rules
- **Flexible Error Display** - Configurable error message placement
- **Two-Way Binding** - Synchronizes form data with your Vue model
- **First-Class RTL Support** - Built with right-to-left languages in mind
- **Lightweight** - No external dependencies, minimal footprint
- **TypeScript Support** - Full type definitions included

## Installation

```bash
# npm
npm install form-vhtml

# yarn
yarn add form-vhtml

# pnpm
pnpm add form-vhtml
```

## Quick Start

### Global Registration

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import { install as installFormVHtml } from 'form-vhtml'

const app = createApp(App)
installFormVHtml(app)
app.mount('#app')
```

### Local Registration

```vue
<script setup>
import { ref } from 'vue';
import { FormVHtml } from 'form-vhtml';

const form = ref({ 
  fullName: '', 
  email: '' 
});

const submitForm = () => {
  console.log('Form submitted:', form.value);
};
</script>

<template>
  <FormVHtml v-model="form">
    <form @submit.prevent="submitForm">
      <input name="fullName" label="Full Name" required minlength="2" />
      <input name="email" type="email" label="Email" required />
      <button type="submit">Submit</button>
    </form>
  </FormVHtml>
</template>
```

## Basic Concepts

FormVHtml is built around these core principles:

1. **Simplicity** - Use standard HTML elements and attributes when possible
2. **Automatic Structure** - Generate proper form layout without extra markup
3. **Convention over Configuration** - Reasonable defaults with options to customize
4. **Minimal Learning Curve** - If you know HTML forms, you know FormVHtml

## Form Structure

FormVHtml automatically transforms your form inputs into proper form groups with labels. This:

```html
<input name="fullName" label="Full Name" required />
```

Becomes:

```html
<div class="form-group form-group-fullName">
  <label for="fullName">Full Name</label>
  <input name="fullName" id="fullName" required />
  <!-- Error message will appear here when validation fails -->
</div>
```

You can use any standard form element:

```html
<input type="text" name="username" label="Username" />
<input type="email" name="email" label="Email" />
<input type="password" name="password" label="Password" />
<input type="checkbox" name="subscribe" label="Subscribe" />
<input type="radio" name="gender" value="male" label="Male" />
<select name="country" label="Country">
  <option value="us">United States</option>
  <option value="ca">Canada</option>
</select>
<textarea name="comments" label="Comments"></textarea>
```

## Validation

FormVHtml relies on standard HTML5 validation attributes:

```html
<!-- Required field -->
<input name="fullName" label="Full Name" required />

<!-- Minimum length -->
<input name="password" type="password" label="Password" required minlength="8" />

<!-- Email validation -->
<input name="email" type="email" label="Email" required />

<!-- Pattern matching (phone number) -->
<input name="phone" type="tel" label="Phone" data-regex="^\d{3}-\d{3}-\d{4}$" />

<!-- Field matching (password confirmation) -->
<input name="password" type="password" label="Password" required />
<input name="passwordConfirm" type="password" label="Confirm Password" 
       required data-match="password" />
```

## Error Handling

### Error Placement

You can control where error messages appear:

```vue
<FormVHtml error-placement="above-input">
  <!-- Error messages will appear above each input -->
</FormVHtml>
```

Available options:
- `below-input` (default) - Shows errors below each input
- `above-input` - Shows errors above each input
- `parent` - Emits errors to parent component without displaying them
- `export` - Only exports errors via events

### Validation Timing

Control when validation occurs:

```vue
<FormVHtml validation-timing="input">
  <!-- Validates on each keystroke -->
</FormVHtml>
```

Available options:
- `blur` (default) - Validates when input loses focus
- `input` - Validates on each input change
- `submit` - Validates only on form submission

### Custom Error Template

Prepend a custom string to error messages:

```vue
<FormVHtml error-template="* ">
  <!-- Error messages will be prefixed with "* " -->
</FormVHtml>
```

## RTL Support

FormVHtml has built-in support for right-to-left languages. Simply use RTL language content for your labels:

```html
<input name="fullName" label="שם מלא" required />
<input name="email" type="email" label="אימייל" required />
```

The form will automatically handle RTL text alignment and layout.

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Object` | `{}` | Form data object (use with v-model) |
| `errorPlacement` | `String` | `'below-input'` | Where to display errors: 'above-input', 'below-input', 'parent', or 'export' |
| `validationTiming` | `String` | `'blur'` | When to validate: 'blur', 'input', or 'submit' |
| `errorClass` | `String` | `'error-message'` | CSS class for error messages |
| `errorTemplate` | `String` | `''` | Template string to prepend to error messages |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Object` | Emitted when form values change |
| `form-submit` | `Object` | Emitted on successful form submission (after validation) |
| `validation-errors` | `Object` | Emitted when validation errors change (if errorPlacement is 'parent' or 'export') |

### Methods

Access component methods using a template ref:

```vue
<script setup>
import { ref } from 'vue';

const formRef = ref(null);

const validate = () => {
  const isValid = formRef.value.validate();
  console.log('Form valid:', isValid);
};
</script>

<template>
  <FormVHtml ref="formRef" v-model="form">
    <!-- form content -->
  </FormVHtml>
  <button @click="validate">Validate Form</button>
</template>
```

Available methods:

| Method | Returns | Description |
|--------|---------|-------------|
| `validate()` | `Boolean` | Validates all form fields, returns true if valid |
| `getErrors()` | `Object` | Returns the current validation errors object |

### Directives

FormVHtml provides directives for manual label association:

| Directive | Description |
|-----------|-------------|
| `v-auto-label` | Creates a label for the input element |
| `v-label` | Alias for v-auto-label |

Example:

```vue
<div class="custom-form-group">
  <input name="username" v-auto-label="'Username'" required />
</div>
```

## Styling

FormVHtml generates the following structure:

```html
<div class="form-group form-group-{name}">
  <label for="{name}">{label}</label>
  <input name="{name}" ... />
  <div class="error-message" data-error-for="{name}">Error message</div>
</div>
```

You can style these elements using CSS:

```css
/* Basic styling */
.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.input-error {
  border-color: #dc3545;
}

/* Target specific form groups */
.form-group-email input {
  /* Custom styling for email field */
}
```

## Advanced Usage

### Custom Error Handling

You can capture and process validation errors:

```vue
<script setup>
import { ref } from 'vue';

const formErrors = ref({});

const handleErrors = (errors) => {
  formErrors.value = errors;
  console.log('Current errors:', errors);
};
</script>

<template>
  <FormVHtml 
    v-model="form" 
    error-placement="export"
    @validation-errors="handleErrors"
  >
    <!-- form content -->
  </FormVHtml>
  
  <!-- Custom error display -->
  <div v-if="Object.keys(formErrors).length > 0" class="error-summary">
    <h3>Please fix the following errors:</h3>
    <ul>
      <li v-for="(error, field) in formErrors" :key="field">
        {{ error }}
      </li>
    </ul>
  </div>
</template>
```

### Dynamic Form Fields

You can dynamically generate form fields:

```vue
<script setup>
import { ref } from 'vue';

const fields = ref([
  { name: 'fullName', label: 'Full Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone', type: 'tel', required: false }
]);
</script>

<template>
  <FormVHtml v-model="form">
    <form @submit.prevent="submitForm">
      <template v-for="field in fields" :key="field.name">
        <input 
          :name="field.name" 
          :type="field.type"
          :label="field.label"
          :required="field.required"
        />
      </template>
      <button type="submit">Submit</button>
    </form>
  </FormVHtml>
</template>
```

## Examples

### Login Form

```vue
<template>
  <FormVHtml v-model="loginForm">
    <form @submit.prevent="login">
      <input name="username" label="Username" required minlength="3" />
      <input name="password" type="password" label="Password" required minlength="8" />
      <div class="form-actions">
        <button type="submit">Login</button>
      </div>
    </form>
  </FormVHtml>
</template>

<script setup>
import { ref } from 'vue';

const loginForm = ref({
  username: '',
  password: ''
});

const login = () => {
  console.log('Login with:', loginForm.value);
};
</script>
```

### Registration Form

```vue
<template>
  <FormVHtml v-model="regForm" error-placement="above-input">
    <form @submit.prevent="register">
      <input name="fullName" label="Full Name" required minlength="2" />
      <input name="email" type="email" label="Email" required />
      <input name="password" type="password" label="Password" required minlength="8" />
      <input 
        name="passwordConfirm" 
        type="password" 
        label="Confirm Password" 
        required 
        data-match="password" 
      />
      <select name="country" label="Country" required>
        <option value="">-- Select Country --</option>
        <option value="us">United States</option>
        <option value="ca">Canada</option>
        <option value="uk">United Kingdom</option>
      </select>
      <div class="checkbox-group">
        <input type="checkbox" name="terms" label="I agree to Terms" required />
      </div>
      <button type="submit">Register</button>
    </form>
  </FormVHtml>
</template>

<script setup>
import { ref } from 'vue';

const regForm = ref({
  fullName: '',
  email: '',
  password: '',
  passwordConfirm: '',
  country: '',
  terms: false
});

const register = () => {
  console.log('Register with:', regForm.value);
};
</script>
```

### RTL Form

```vue
<template>
  <div dir="rtl">
    <FormVHtml v-model="form">
      <form @submit.prevent="submit">
        <input name="fullName" label="שם מלא" required />
        <input name="email" type="email" label="אימייל" required />
        <input name="phone" type="tel" label="טלפון" required />
        <button type="submit">שלח טופס</button>
      </form>
    </FormVHtml>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const form = ref({
  fullName: '',
  email: '',
  phone: ''
});

const submit = () => {
  console.log('Form submitted:', form.value);
};
</script>
```

## TypeScript Support

FormVHtml includes complete TypeScript definitions:

```typescript
import { FormVHtml } from 'form-vhtml';
import type { 
  ErrorPlacement,
  ValidationSchema,
  ValidationError
} from 'form-vhtml';

// Use types in your component
const errorPlacement: ErrorPlacement = 'above-input';
```

## Browser Compatibility

FormVHtml supports all modern browsers:

- Chrome, Firefox, Safari, Edge (latest 2 versions)
- IE 11 (with appropriate polyfills)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT