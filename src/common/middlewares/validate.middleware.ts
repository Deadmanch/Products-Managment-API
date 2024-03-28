import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { HTTPStatusCode } from '../http.status-code.enum';
import { IMiddleware } from './middlewares.interface';

export class ValidateMiddleware implements IMiddleware {
	constructor(private classToValidate: ClassConstructor<object>) {}

	execute({ body }: Request, res: Response, next: NextFunction): void {
		const instance = plainToClass(this.classToValidate, body);
		validate(instance).then((errors) => {
			if (errors.length > 0) {
				res.status(HTTPStatusCode.UNPROCESSABLE_ENTITY).send(errors);
			} else {
				next();
			}
		});
	}
}
