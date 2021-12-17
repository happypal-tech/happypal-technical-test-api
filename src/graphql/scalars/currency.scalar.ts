import { CustomScalar, Scalar } from '@nestjs/graphql';

import { ValueNode } from 'graphql';
import { CurrencyResolver as GraphQLCurrency } from 'graphql-scalars';

@Scalar('Currency')
export class CurrencyScalar implements CustomScalar<string, string> {
  description = GraphQLCurrency.description || undefined;

  parseValue(value: string): string {
    return GraphQLCurrency.parseValue(value);
  }

  serialize(value: string): string {
    return GraphQLCurrency.serialize(value);
  }

  parseLiteral(ast: ValueNode): string {
    return GraphQLCurrency.parseLiteral(ast, null);
  }
}
