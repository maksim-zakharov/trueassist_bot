import { ValidationError } from 'class-validator';

export function formatValidationErrors(errors: ValidationError[]) {
    return errors.map(error => ({
        field: error.property,
        errors: Object.values(error.constraints || {})
    }));
}