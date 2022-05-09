import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Currency } from 'dinero.js';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

import { CurrencyScalar } from '@/graphql/scalars/currency.scalar';
import { Node, PartialModel } from '@/node/models/node.model';
import { Picture } from '@/picture/models/picture.model';
import { User } from '@/user/models/user.model';

@Entity()
@ObjectType({ implements: [Node] })
export class Product extends Node {
  constructor(input?: PartialModel<Product>) {
    super(input);
  }

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => Int)
  @Column()
  priceValue: number;

  // product is available or not, available by default
  @Field()
  @Column('boolean', {default: true})
  isAvailable: boolean;

  @Field(() => CurrencyScalar)
  @Column({ type: 'varchar', length: 3 })
  priceCurrency: Currency;

  @ManyToOne(() => User, (target) => target.productsOwned, { nullable: false })
  owner: User;

  @Field(() => Picture, { nullable: true })
  @ManyToMany(() => Picture)
  @JoinTable()
  pictures: Picture[];
}
