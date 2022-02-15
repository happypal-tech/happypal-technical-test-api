import { Node, PartialModel } from "@/node/models/node.model";
import { Product } from "@/product/models/product.model";
import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, OneToMany } from "typeorm";

@Entity()
@ObjectType({ implements: [Node] })
export class Brand extends Node {
    constructor(input?: PartialModel<Brand>) {
        super(input);
    }

    @Field()
    @Column({ unique: true })
    name: string;

    @OneToMany(() => Product, (target) => target.brand)
    products: Product[]
}
