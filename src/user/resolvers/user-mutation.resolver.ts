import { Roles } from "@/auth/decorators/Roles.decorator";
import { Viewer } from "@/auth/decorators/Viewer.decorator";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { UseGuards } from "@nestjs/common";
import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { UserUpdateInput, UserUpdateOutput } from "../dto/user-update.dto";
import { Role } from "../enums/role.enum";
import { UserService } from "../user.service";

@Resolver()
@UseGuards(RolesGuard)
export class UserMutationResolver {
    constructor(private readonly userService: UserService) { }

    @Mutation(() => UserUpdateOutput)
    @Roles(Role.Admin)
    userUpdate(
        @Viewer() viewer: Viewer,
        @Args('input') input: UserUpdateInput,
    ) {
        return this.userService.userUpdate(viewer, input);
    }
}