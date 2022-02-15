import { Query, Resolver } from '@nestjs/graphql';

import { Viewer } from '@/auth/decorators/Viewer.decorator';

import { User } from '../models/user.model';
import { UserService } from '../user.service';

@Resolver(User)
export class UserQueriesResolver {
  constructor(private readonly userService: UserService) { }

  @Query(() => User, { nullable: true })
  public viewer(@Viewer() viewer: Viewer) {
    return viewer;
  }
}
