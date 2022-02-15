import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Currency } from 'dinero.js';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

import { CurrencyScalar } from '@/graphql/scalars/currency.scalar';
import { Node, PartialModel } from '@/node/models/node.model';
import { Picture } from '@/picture/models/picture.model';
import { User } from '@/user/models/user.model';
import { Brand } from '@/brand/models/brand.model';

@Entity()
@ObjectType({ implements: [Node] })
export class Product extends Node {
  constructor(input?: PartialModel<Product>) {
    super(input);
  }

  @Field()
  @Column({ unique: true })
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => Int)
  @Column()
  priceValue: number;

  @Field(() => CurrencyScalar)
  @Column({ type: 'varchar', length: 3 })
  priceCurrency: Currency;

  @ManyToOne(() => User, (target) => target.productsOwned, { nullable: false, eager: true })
  owner: User;

  @Field(() => [Picture], { nullable: true })
  @ManyToMany(() => Picture)
  @JoinTable()
  pictures: Picture[];

  @Column({ nullable: true })
  brandId?: string;

  @Field(() => Brand, { nullable: true })
  @ManyToOne(() => Brand, (target) => target.products, { nullable: true, eager: true })
  @JoinColumn({ name: "brandId" })
  brand?: Brand;
}
