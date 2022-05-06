import { Field, InterfaceType } from '@nestjs/graphql';

import { DeleteDateColumn } from 'typeorm';

import { Node, PartialModel } from './node.model';

@InterfaceType({ implements: [Node] })
export class NodeDeletable extends Node {
  constructor(input?: PartialModel<NodeDeletable>) {
    super(input);
  }

  @Field(() => Date, { nullable: true })
  @DeleteDateColumn()
  deletedAt?: Date | null;
}
