import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';

import { Node, PartialModel } from '@/node/models/node.model';
import { User } from '@/user/models/user.model';

@Entity()
export class ResetPasswordToken extends Node {
  constructor(input?: PartialModel<ResetPasswordToken>) {
    super(input);
  }

  @Column({ type: 'text', unique: true })
  value: string;

  @Column({ type: 'timestamp', nullable: true })
  consumedAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date | null;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @RelationId((self: ResetPasswordToken) => self.user)
  readonly userId: User['id'];
}
