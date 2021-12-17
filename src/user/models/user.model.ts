import { Field, ObjectType } from '@nestjs/graphql';

import { Column, Entity, OneToMany } from 'typeorm';

import { RefreshToken } from '@/auth/models/refresh-token.model';
import { Node, PartialModel } from '@/node/models/node.model';
import { Product } from '@/product/models/product.model';

@Entity()
@ObjectType({ implements: [Node] })
export class User extends Node {
  constructor(input?: PartialModel<User>) {
    super(input);
  }

  @Field()
  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text' })
  password: string;

  @OneToMany(() => RefreshToken, (target) => target.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Product, (target) => target.owner)
  productsOwned: Product[];
}
