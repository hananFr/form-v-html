


export type ErrorPlacement =
    | 'above-input'
    | 'below-input'
    | 'parent'
    | 'export';



export type ValidationBuiltInRule =
    | 'required'
    | 'min'
    | 'max'
    | 'minValue'
    | 'maxValue'
    | 'email'
    | 'pattern'
    | 'regex'
    | 'match'
    | 'equals';

export interface DependsRule {
    field: string;
    value: unknown;
    rule: ValidationBuiltInRule;
}

export interface ValidationRule {
    /* string length rules */
    required?: boolean;
    min?: number;
    max?: number;

    /* numeric value rules */
    minValue?: number;
    maxValue?: number;

    /* pattern rules */
    email?: boolean;
    pattern?: string;
    regex?: string;

    /* equality rules */
    equals?: string; // alias: match
    match?: string;

    /* conditional validation */
    depends?: DependsRule;
}

export type ValidationSchema = Record<string, ValidationRule | string>;

export interface ValidationError {
    field: string;
    message: string;
}

/* ---------- External‑validator hook ---------------------------------- */
export interface ExternalValidatorConfig {
    /** 'yup' | 'zod' | 'veeValidate' | 'custom' */
    type?: string;
    /** custom validate(field, value, schema) */
    validate?: (...args: unknown[]) => unknown;
}

/* ---------- Component Props ------------------------------------------ */
export interface SmartFormProps {
    /* model */
    modelValue?: Record<string, unknown>;
    defaultValues?: Record<string, unknown>;

    /* validation */
    validationSchema?: ValidationSchema;
    externalValidator?: ExternalValidatorConfig;

    /* error handling */
    errorPlacement?: ErrorPlacement;
    errorTemplate?: (el: HTMLElement, errorMessage: string) => HTMLElement;
    errorClass?: string;
    inputErrorClass?: string;
    validationTiming?: 'blur' | 'input' | 'submit';
    validateOnChange?: boolean; // deprecated
    validateOnBlur?: boolean;   // deprecated
    validateOnMount?: boolean;  // deprecated

    /* i18n */
    locale?: string;
    customMessages?: Record<string, Record<string, string>>;

    /* multi‑step wizard */
    multiStep?: boolean;
    currentStep?: number;
    stepFields?: string[][];
}

/* ---------- Exposed instance methods --------------------------------- */
export interface SmartFormExpose {
    /* model access */
    getFieldValue(fieldName: string): unknown;
    setFieldValue(fieldName: string, value: unknown): void;

    /* validation */
    validateField(fieldName: string): boolean;
    validate(): boolean;

    /* errors */
    getErrors(): Record<string, string>;
    setErrors(errors: Record<string, string>): void;
    reset(): void;

    /* steps */
    validateCurrentStep(): boolean;
    nextStep(): boolean;
    prevStep(): boolean;

    /* dynamic fields */
    addDynamicField(fieldName: string, initialValue?: unknown): void;
    removeDynamicField(fieldName: string): void;
}
