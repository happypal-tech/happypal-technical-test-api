import { ApolloError } from 'apollo-server-errors';

import { ErrorCodes, errors } from '../error-definitions';

export class BaseError<
  C extends ErrorCodes = ErrorCodes,
  A extends Parameters<typeof errors[C]['template']> = Parameters<
    typeof errors[C]['template']
  >,
> extends ApolloError {
  statusCode: number;

  constructor(reason: C, ...args: [...A, Record<string, any>?]) {
    const templator = errors[reason].template;
    const variables = args.slice(0, templator.length) as A;
    const message = (templator as (...args: A) => string)(...variables);
    const extensions = args.slice(templator.length, templator.length + 1)[0];

    super(message, reason, extensions);

    Object.defineProperty(this, 'name', {
      value: 'InternalServerError',
      configurable: true,
    });

    Object.defineProperty(this, 'statusCode', {
      value: 500,
      configurable: true,
    });
  }
}
