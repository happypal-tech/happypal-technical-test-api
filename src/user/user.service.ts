import { AuthService } from '@/auth/auth.service';
import { Viewer } from '@/auth/decorators/Viewer.decorator';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ForbiddenError } from 'apollo-server-errors';
import { Repository } from 'typeorm';
import { UserUpdateInput, UserUpdateOutput } from './dto/user-update.dto';
import { Role } from './enums/role.enum';
import { User } from './models/user.model';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly authService: AuthService
    ) { }

    public async userUpdate(viewer: Viewer, userUpdateInput: UserUpdateInput): Promise<UserUpdateOutput> {
        if (!viewer) {
            throw new UnauthorizedException();
        }

        const user = await this.userRepo.preload({ ...userUpdateInput });

        if (!user) {
            throw new NotFoundException();
        }

        if (viewer.role !== Role.Admin) {
            throw new ForbiddenError("Not allow");
        }

        await this.userRepo.save(user);

        return { user }
    }
}
