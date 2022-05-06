import { Field, ObjectType } from '@nestjs/graphql';

import { Column, Entity } from 'typeorm';

import { Node, PartialModel } from '@/node/models/node.model';

@Entity()
@ObjectType({ implements: [Node] })
export class Picture extends Node {
  constructor(input?: PartialModel<Picture>) {
    super(input);
  }

  @Field()
  @Column()
  mimetype: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  originalName?: string;

  @Field()
  @Column()
  hash: string;

  @Field()
  @Column()
  size: number;

  @Field()
  @Column()
  width: number;

  @Field()
  @Column()
  height: number;
}
