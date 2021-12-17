import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  RelationId,
} from 'typeorm';

import { Node, PartialModel } from '@/node/models/node.model';
import { User } from '@/user/models/user.model';

export enum RefreshTokenRevokedReason {
  LOGOUT = 'LOGOUT',
  SUSPICIOUS = 'SUSPICIOUS',
  ABUSE = 'ABUSE',
}

@Entity()
export class RefreshToken extends Node {
  constructor(input?: PartialModel<RefreshToken>) {
    super(input);
  }

  @Column({ type: 'text', unique: true })
  value: string;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt?: Date | null;

  @Column('enum', { enum: RefreshTokenRevokedReason, nullable: true })
  revokedReason?: RefreshTokenRevokedReason | null;

  @ManyToOne(() => RefreshToken, (target) => target.slaves)
  @JoinColumn()
  master?: RefreshToken | null;

  @RelationId((self: RefreshToken) => self.master)
  readonly masterId: RefreshToken['id'] | null;

  @OneToMany(() => RefreshToken, (target) => target.master)
  slaves: RefreshToken[];

  @OneToOne(() => RefreshToken, (target) => target.child)
  @JoinColumn()
  parent?: RefreshToken | null;

  @RelationId((self: RefreshToken) => self.parent)
  readonly parentId: RefreshToken['id'] | null;

  @OneToOne(() => RefreshToken, (target) => target.parent)
  child?: RefreshToken | null;

  @ManyToOne(() => User, (target) => target.refreshTokens, { nullable: false })
  @JoinColumn()
  user: User;

  @RelationId((self: RefreshToken) => self.user)
  readonly userId: User['id'];
}
