import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { USER_IS_NOT_ENOUGH_RIGHTS } from '../../constants/user.msg';
import { HTTPStatusCode } from '../http.status-code.enum';
import { IMiddleware } from './middlewares.interface';

export class PermissionGuard implements IMiddleware {
	#roles: Role[] = [];

	constructor(roles: Role[]) {
		this.#roles = roles;
	}

	execute(req: Request, res: Response, next: NextFunction): void {
		if (req.role && this.#roles.includes(req.role)) {
			return next();
		}
		res.status(HTTPStatusCode.FORBIDDEN).send({ error: USER_IS_NOT_ENOUGH_RIGHTS });
	}
}
