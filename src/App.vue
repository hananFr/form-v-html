<template>
    <div id="app">
        <h1>רישום משתמש (עם Zod)</h1>
        <FormVHtml ref="formVHtmlRef" v-model="formData" :externalValidator="{ type: 'zod' }"
            :validationSchema="userSchema" @form-submit="handleSubmit" errorPlacement="below-input"
            validationTiming="blur" errorClass="error-text-zod">
            <form @submit.prevent>
                <div class="form-group">
                    <label for="name">שם מלא:</label>
                    <input id="name" name="name" type="text" placeholder="הכנס שם מלא" />
                </div>

                <div class="form-group">
                    <label for="email">כתובת אימייל:</label>
                    <input id="email" name="email" type="email" placeholder="your@email.com" />
                </div>

                <div class="form-group">
                    <label for="password">סיסמה:</label>
                    <input id="password" name="password" type="password" placeholder="לפחות 8 תווים" />
                </div>

                <div class="form-group">
                    <label for="confirmPassword">אימות סיסמה:</label>
                    <input id="confirmPassword" name="confirmPassword" type="password" placeholder="הקלד סיסמה שוב"
                        data-match="password" />
                </div>

                <button type="submit">הרשמה</button>
            </form>
        </FormVHtml>

        <button @click="simulateServerErrors" style="margin-top: 10px; background-color: orange;">
            דמה שגיאות שרת
        </button>

        <div v-if="submittedData" class="submitted-data">
            <h2>נתונים שנשלחו:</h2>
            <pre>{{ submittedData }}</pre>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { z } from 'zod';
import FormVHtml from './components/FormVHtml.vue'; // ודא שהנתיב נכון


// 1. Define Zod Schema
const userSchema = z.object({
    name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
    email: z.string().email('כתובת אימייל לא תקינה'),
    password: z.string().min(8, 'סיסמה חייבת להכיל לפחות 8 תווים'),
    // Note: Zod doesn't have a built-in "match" rule like HTML.
    // The data-match attribute in the template will handle this comparison
    // using the built-in 'match' rule within FormVHtml.
    // If you need schema-level password confirmation with Zod,
    // you'd typically use .refine() on the object level.
    confirmPassword: z.string().min(1, 'אימות סיסמה הוא שדה חובה') // Basic required check
}).refine(data => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"], // Attach error to confirmPassword field
});


// 2. Reactive form data
const formData = ref({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
});

// 3. Submitted data state
const submittedData = ref(null);

// 4. Handle successful submission
const handleSubmit = (data) => {
    submittedData.value = data
    console.log('Submitted data:', data);
};

const formVHtmlRef = ref(null);

const simulateServerErrors = () => {
    if (!formVHtmlRef.value) {
        console.error("FormVHtml ref is not available");
        return;
    }

    // Sample error object (like one you might get from a server)
    const sampleErrors = {
        name: 'השם הזה כבר תפוס בשרת.',
        email: 'פורמט האימייל לא נראה תקין בצד השרת.',
        // You can also set null/undefined to clear a specific field's error
        // password: null
    };

    console.log('Simulating setting server errors:', sampleErrors);
    formVHtmlRef.value.setErrors(sampleErrors);
};
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 60px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

input[type="text"],
input[type="email"],
input[type="password"] {
    width: calc(100% - 20px);
    /* Adjust for padding */
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
}

button[type="submit"] {
    background-color: #4CAF50;
    color: white;
    padding: 12px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
    background-color: #45a049;
}

/* Custom error class for Zod errors */
.error-text-zod {
    color: #d9534f;
    /* Red color for errors */
    font-size: 0.875em;
    margin-top: 5px;
}

/* Style inputs with errors (optional) */
input:has(+ .error-text-zod),
input:has(~ .error-text-zod) {
    /* Basic check for adjacent/sibling error */
    border-color: #d9534f;
}


.submitted-data {
    margin-top: 20px;
    padding: 15px;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.submitted-data h2 {
    margin-top: 0;
}

pre {
    white-space: pre-wrap;
    /* Preserve formatting */
    word-wrap: break-word;
}
</style>