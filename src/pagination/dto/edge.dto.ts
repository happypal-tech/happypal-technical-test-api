import { Field, ID, InterfaceType } from '@nestjs/graphql';

import { Node } from '@/node/models/node.model';

@InterfaceType()
export abstract class Edge<N extends Node = Node> {
  @Field(() => ID)
  cursor: string;

  @Field(() => Node)
  node: N;
}
