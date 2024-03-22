import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { IMiddleware } from '../middlewares.interface';

export class AuthMiddleware implements IMiddleware {
	constructor(private readonly secret: string) {}
	execute(req: Request, res: Response, next: NextFunction): void {
		if (req.headers.authorization) {
			const token = req.headers.authorization.split(' ')[1];
			verify(token, this.secret, (err, payload) => {
				if (err) {
					next();
				} else if (payload && typeof payload !== 'string') {
					req.user = payload.email;
					req.role = payload.role;
					next();
				}
			});
		} else {
			next();
		}
	}
}
