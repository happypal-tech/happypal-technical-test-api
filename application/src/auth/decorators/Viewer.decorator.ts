import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { Request } from 'express';

import { User } from '@/user/models/user.model';

export const Viewer = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const context =
      GqlExecutionContext.create(ctx).getContext<{ req: Request }>();

    const viewer = context.req?.user as User;

    if (!viewer) return null;

    return viewer;
  },
);

export type Viewer = User | null;
