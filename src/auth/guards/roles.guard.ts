import { Role } from '@/user/enums/role.enum';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/Roles.decorator';
import { getRequestByContext } from '../utils/getRequest';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = getRequestByContext(context);
        return this.validateRole(requiredRoles, user.role);
    }

    private validateRole(requiredRoles: Role[], userRole: Role) {
        return requiredRoles.includes(userRole);
    }
}