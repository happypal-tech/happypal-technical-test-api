import { ValidationError } from 'class-validator';

export function flattenValidationErrors(
  errors: ValidationError[],
  fields: Record<string, Record<string, string>> = {},
  path?: string,
) {
  errors.forEach((error) => {
    if (error.constraints) {
      fields[[path, error.property].filter(Boolean).join('.')] =
        error.constraints;
    }

    if (error.children) {
      flattenValidationErrors(
        error.children,
        fields,
        [path, error.property].filter(Boolean).join('.'),
      );
    }
  });

  return fields;
}
