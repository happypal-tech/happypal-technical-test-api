import { ErrorCodes, errors } from '../error-definitions';
import { BaseError } from './Base.error';

export class UnauthorizedError<
  C extends ErrorCodes,
  A extends Parameters<typeof errors[C]['template']>,
> extends BaseError<C, A> {
  constructor(reason: C, ...args: [...A, Record<string, any>?]) {
    super(reason, ...args);

    Object.defineProperty(this, 'name', {
      value: 'UnauthorizedError',
    });

    Object.defineProperty(this, 'statusCode', {
      value: 401,
    });
  }
}
