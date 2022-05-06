/*eslint sort-keys-fix/sort-keys-fix: ["error", "asc", {caseSensitive: false}]*/

export type ErrorCodes = keyof typeof errors;

export function getErrorDefinition<
  C extends ErrorCodes,
  A extends Parameters<typeof errors[C]['template']>,
>(reason: C, ...args: A) {
  return {
    message: (errors[reason].template as (...args: A) => string)(...args),
    reason: reason,
  };
}

export const errors = {
  ['validation-error']: {
    template: () => `Input failed validation`,
  },
};
