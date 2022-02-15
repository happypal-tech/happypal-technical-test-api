import { Field, InputType, ObjectType, OmitType, PartialType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { Role } from "../enums/role.enum";
import { User } from "../models/user.model";

@InputType()
export class UserUpdateInput {
    @Field(() => String)
    @IsString()
    @IsUUID()
    id: User['id'];

    @Field()
    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;
}


@ObjectType()
export class UserUpdateOutput {
    @Field(() => User)
    user: User;
}
