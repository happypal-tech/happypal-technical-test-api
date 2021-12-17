import { Field, ID, InterfaceType } from '@nestjs/graphql';

import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@InterfaceType()
export class Node {
  constructor(input?: PartialModel<Node>) {
    if (input) {
      for (const [key, value] of Object.entries(input)) {
        (this as any)[key] = value;
      }
    }
  }

  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Field(() => Date)
  @CreateDateColumn()
  readonly createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}

type IfEquals<X, Y, A, B> = (<T>() => T extends X ? 1 : 2) extends <
  T,
>() => T extends Y ? 1 : 2
  ? A
  : B;

type WritableKeysOf<T> = {
  [P in keyof T]: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P,
    never
  >;
}[keyof T];

export type PartialModel<T> = Partial<Pick<T, WritableKeysOf<T>>>;
