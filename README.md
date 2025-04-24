# FormVHtml - Vue Form Validation Library

A lightweight, flexible Vue form validation library with RTL support. FormVHtml simplifies form creation and validation with automatic label generation, customizable error handling, and reactive form state management.

## Features

- **Automatic Form Generation**: Automatically wrap inputs with form groups and labels
- **Validation Support**: Built-in validation rules with custom error messages
- **RTL Support**: Full right-to-left language support for Hebrew and other RTL languages
- **Customizable Error Display**: Options for error placement (above/below inputs)
- **Reactive Form State**: Automatic model updating with two-way binding

## Installation

```bash
npm install form-vhtml
# or
yarn add form-vhtml
```

## Quick Start

```js
import { createApp } from 'vue'
import FormVHtml from 'form-vhtml'
import App from './App.vue'

const app = createApp(App)
app.use(FormVHtml) // Registers FormVHtml component and directives
app.mount('#app')
```

## Basic Usage

```vue
<script setup>
import { ref } from 'vue';
import { FormVHtml } from 'form-vhtml';

const form = ref({ fullName: '', email: '' });

const submitForm = () => {
  console.log(form.value);
}
</script>

<template>
  <FormVHtml v-model="form" error-placement="above-input">
    <form @submit.prevent="submitForm">
      <input name="fullName" label="Full Name" required minlength="2" />
      <input name="email" type="email" label="Email" required />
      <button type="submit">Submit</button>
    </form>
  </FormVHtml>
</template>
```

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Object` | `{}` | Form data object (use with v-model) |
| `errorPlacement` | `String` | `'below-input'` | Where to display errors: 'above-input', 'below-input', 'parent', or 'export' |
| `validationTiming` | `String` | `'blur'` | When to validate: 'blur', 'input', or 'submit' |
| `errorClass` | `String` | `'error-message'` | CSS class for error messages |
| `errorTemplate` | `String` | `''` | Template string to prepend to error messages |

## RTL Support

FormVHtml has built-in support for RTL languages like Hebrew. Just provide your labels in the RTL language and the form will display correctly:

```vue
<input name="fullName" label="שם מלא" required />
```

## Form Validation

The library supports several validation rules directly from HTML attributes:

- `required`: Makes the field required
- `minlength="n"`: Minimum string length
- `maxlength="n"`: Maximum string length
- `type="email"`: Email format validation
- `data-regex="pattern"`: Regular expression validation
- `data-match="fieldName"`: Match another field's value

## Styling

The component generates the following structure:

```html
<div class="form-group form-group-fieldname">
  <label for="fieldname">Field Label</label>
  <input name="fieldname" ... />
  <div class="error-message" data-error-for="fieldname">Error message</div>
</div>
```

You can customize the appearance with CSS:

```css
.form-group {
  margin-bottom: 1rem;
}

.error-message {
  color: red;
  font-size: 0.8rem;
}

.input-error {
  border: 1px solid red;
}
```

## Component Methods

Access component methods via refs:

```vue
<script setup>
import { ref } from 'vue';

const formRef = ref(null);

const validateForm = () => {
  const isValid = formRef.value.validate();
  if (isValid) {
    // Form is valid
  }
};
</script>

<template>
  <FormVHtml ref="formRef" v-model="form">
    <!-- form content -->
  </FormVHtml>
</template>
```

Available methods:

- `validate()`: Validates all form fields, returns boolean
- `getErrors()`: Returns current validation errors object

## Directives

FormVHtml provides two directives for cases when you want more control:

```vue
<input v-auto-label="'Username'" name="username" />
<!-- or -->
<input v-label="'Username'" name="username" />
```

## Custom Error Handling

You can capture validation errors with the `validation-errors` event:

```vue
<FormVHtml 
  v-model="form" 
  error-placement="export"
  @validation-errors="handleErrors"
>
  <!-- form content -->
</FormVHtml>
```

## TypeScript Support

FormVHtml includes TypeScript definitions for all props, events, and exposed methods.

## Browser Support

- All modern browsers
- IE 11 with appropriate polyfills

## License

MIT