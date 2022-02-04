import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from './models/user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  public findById(id: string) {
    return this.userRepo
      .createQueryBuilder('user')
      .where('user.id = :id')
      .setParameters({ id })
      .getOneOrFail();
  }

  public findByEmail(email: string, strictValue = false) {
    return this.userRepo.findOne({
      where: {
        ...(strictValue && { email }),
        ...(!strictValue && { email: this.getSearchableEmail(email) }),
      },
    });
  }

  public getSearchableEmail(email: string) {
    return email && email.trim().toLowerCase();
  }

  public save(user: User) {
    return this.userRepo.save(user);
  }
}
