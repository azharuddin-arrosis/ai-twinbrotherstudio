import { useState, useCallback } from 'react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+\..+/;

function validateField(name, value, rules) {
    if (!rules) return null;

    const str = value == null ? '' : String(value).trim();

    if (rules.required && str.length === 0) {
        return `${formatLabel(name)} is required.`;
    }

    // Skip remaining rules if field is empty and not required
    if (str.length === 0) return null;

    if (rules.minLength != null && str.length < rules.minLength) {
        return `${formatLabel(name)} must be at least ${rules.minLength} characters.`;
    }

    if (rules.maxLength != null && str.length > rules.maxLength) {
        return `${formatLabel(name)} must not exceed ${rules.maxLength} characters.`;
    }

    if (rules.type === 'email' && !EMAIL_REGEX.test(str)) {
        return `${formatLabel(name)} must be a valid email address.`;
    }

    if (rules.type === 'url' && !URL_REGEX.test(str)) {
        return `${formatLabel(name)} must be a valid URL (e.g. https://example.com).`;
    }

    return null;
}

function formatLabel(fieldName) {
    // Convert camelCase / snake_case to "Title Case"
    return fieldName
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^\w/, (c) => c.toUpperCase())
        .trim();
}

export function useValidation(schema, data) {
    const [clientErrors, setClientErrors] = useState({});

    const validate = useCallback(
        (fieldName, value) => {
            const error = validateField(fieldName, value, schema[fieldName]);
            setClientErrors((prev) => ({ ...prev, [fieldName]: error }));
            return error;
        },
        [schema],
    );

    const touchAll = useCallback(() => {
        const errors = {};
        Object.keys(schema).forEach((fieldName) => {
            errors[fieldName] = validateField(fieldName, data[fieldName], schema[fieldName]);
        });
        setClientErrors(errors);
        return errors;
    }, [schema, data]);

    const hasErrors = Object.values(clientErrors).some((e) => e != null && e !== '');

    return { clientErrors, validate, touchAll, hasErrors };
}

export default useValidation;
