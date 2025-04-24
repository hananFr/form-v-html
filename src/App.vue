<script setup>
import { ref } from 'vue';
import FormVHtml from './components/FormVHtml.vue';

const form = ref({ fullName: '', email: '' });
const labelName = 'שם מלא';

const submitForm = () => {
    console.log(form.value);
    console.log(form.value.file);
}
</script>

<template>
    <FormVHtml v-model="form" error-placement="above-input" error-template="* ">
        <form @submit.prevent="submitForm">
            <input name="fullName" :label="labelName" placeholder="Full name" required minlength="2" />
            <input name="email" type="email" :label="'אימייל'" placeholder="example@mail.com" required />
            <input name="phone" type="tel" :label="'טלפון'" placeholder="050-123-4567" required />
            <input name="address" type="text" :label="'כתובת'" placeholder="כתובת" required />
            <input name="city" type="text" :label="'עיר'" placeholder="עיר" required />
            <input name="zip" type="text" :label="'מיקוד'" placeholder="מיקוד" required />
            <input name="country" type="text" :label="'מדינה'" placeholder="מדינה" required />
            <input name="birthDate" type="date" :label="'תאריך לידה'" placeholder="תאריך לידה" required />
            <select default-value="male" name="gender" :label="'מין'" required>
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
            </select>
            <input name="idNumber" type="text" :label="'מספר ת.ז.'" placeholder="מספר ת.ז." required />
            <input type="file" name="file" :label="'קובץ'" required />
            <button type="submit">Submit</button>
        </form>
    </FormVHtml>

</template>

<style scoped>
form {
    max-width: 600px;
    justify-content: center;
    justify-self: center;
    margin: 0, auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

:deep(.form-group) {
    padding: 0;
    align-items: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
    gap: 0;
}

:deep(.error-message) {
    color: red;
    padding: 0;
}

:deep(.input-error) {
    border: 2px solid red;
    border-radius: 2px;
    transition: all 0.3s ease;
    animation: error-animate 1s infinite;
}

@keyframes error-animate {
    0% {
        border-color: rgb(255, 0, 0, 0.35);
        transform: scale(1);
    }

    50% {
        border-color: rgb(255, 0, 0, 1);
        transform: scale(1.02);
    }

    100% {
        border-color: rgb(255, 0, 0, 0.35);
        transform: scale(1);
    }
}
</style>