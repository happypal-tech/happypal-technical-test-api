import { ErrorCodes, errors } from '../error-definitions';
import { BaseError } from './Base.error';

export class NotImplementedError<
  C extends ErrorCodes,
  A extends Parameters<typeof errors[C]['template']>,
> extends BaseError<C, A> {
  constructor(reason: C, ...args: [...A, Record<string, any>?]) {
    super(reason, ...args);

    Object.defineProperty(this, 'name', {
      value: 'NotImplementedError',
    });

    Object.defineProperty(this, 'statusCode', {
      value: 501,
    });
  }
}
