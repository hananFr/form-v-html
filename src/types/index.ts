export interface ValidationRule {
    required?: boolean;
    min?: number;
    max?: number;
    minValue?: number;
    maxValue?: number;
    email?: boolean;
    pattern?: string;
    regex?: string;
    equals?: string;
    depends?: {
        field: string;
        value: any;
        rule: string;
    };
}

export interface ValidationSchema {
    [field: string]: ValidationRule | string;
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface SmartFormProps {
    modelValue?: Record<string, any>;
    defaultValues?: Record<string, any>;
    errorPlacement?: 'above-input' | 'below-input' | 'export';
    errorTemplate?: (el: HTMLElement, errorMessage: string) => HTMLElement;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    validateOnMount?: boolean;
    locale?: string;
    customMessages?: Record<string, Record<string, string>>;
    validationSchema?: ValidationSchema;
    errorClass?: string;
    inputErrorClass?: string;
    multiStep?: boolean;
    currentStep?: number;
    stepFields?: string[][];
}

export interface SmartFormExpose {
    getFieldValue: (fieldName: string) => any;
    setFieldValue: (fieldName: string, value: any) => void;
    validateField: (fieldName: string) => boolean;
    validate: () => boolean;
    reset: () => void;
    getErrors: () => Record<string, string>;
    setErrors: (errors: Record<string, string>) => void;
    validateCurrentStep: () => boolean;
    nextStep: () => boolean;
    prevStep: () => boolean;
    addDynamicField: (fieldName: string, initialValue?: any) => void;
    removeDynamicField: (fieldName: string) => void;
} 