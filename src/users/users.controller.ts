import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { sign } from 'jsonwebtoken';
import 'reflect-metadata';
import { BaseController } from '../common/base.controller';
import { TYPES } from '../common/dependency-injection/types';
import { HTTPStatusCode } from '../common/http.status-code.enum';
import { AuthGuard } from '../common/middlewares/auth/auth.guard';
import { PermissionGuard } from '../common/middlewares/permission.guard';
import { ValidateMiddleware } from '../common/middlewares/validate.middleware';
import { IConfigService } from '../config/config.service.interface';
import {
	MANAGER_IS_NOT_EXIST,
	MANAGER_SUCCESSFULLY_REMOVED,
	USER_IS_EXISTS,
	USER_IS_NOT_ENOUGH_RIGHTS,
	USER_IS_NOT_EXIST,
	USER_PASSWORD_ERR,
} from '../enums/user.msg';
import { HTTPError } from '../errors/http-errors';
import { ILogger } from '../logger/logger.interface';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserRemoveDto } from './dto/user-remove.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { IUserController } from './interface/user.controller.interface';
import { UserService } from './users.service';

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.UserService) private userService: UserService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/register',
				method: 'post',
				func: this.register,
				middlewares: [new ValidateMiddleware(UserRegisterDto)],
			},
			{
				path: '/login',
				method: 'post',
				func: this.login,
				middlewares: [new ValidateMiddleware(UserLoginDto)],
			},
			{
				path: '/info',
				method: 'get',
				func: this.info,
				middlewares: [new AuthGuard()],
			},
			{
				path: '/create',
				method: 'post',
				func: this.createManager,
				middlewares: [
					new AuthGuard(),
					new ValidateMiddleware(UserRegisterDto),
					new PermissionGuard([Role.ADMIN]),
				],
			},
			{
				path: '/update',
				method: 'patch',
				func: this.updateManager,
				middlewares: [
					new AuthGuard(),
					new ValidateMiddleware(UserUpdateDto),
					new PermissionGuard([Role.ADMIN]),
				],
			},
			{
				path: '/delete',
				method: 'delete',
				func: this.deleteManager,
				middlewares: [
					new AuthGuard(),
					new ValidateMiddleware(UserRemoveDto),
					new PermissionGuard([Role.ADMIN]),
				],
			},
		]);
	}

	async login(
		{ body }: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const userInfo = await this.userService.getUserInfo(body.email);
		if (!userInfo) {
			return next(new HTTPError(HTTPStatusCode.BAD_REQUEST, USER_IS_NOT_EXIST, 'LOGIN'));
		}
		const isPasswordValid = await this.userService.validateUser(body);
		if (!isPasswordValid) {
			return next(new HTTPError(HTTPStatusCode.UNAUTHORIZED, USER_PASSWORD_ERR, 'LOGIN'));
		}
		console.log(userInfo.password, userInfo.role);
		const jwt = await this.signJWT(body.email, userInfo.role, this.configService.get('SECRET'));
		this.ok(res, { jwt });
	}

	async register(
		{ body }: Request<{}, {}, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userService.register(body);
		if (!result) {
			return next(new HTTPError(HTTPStatusCode.UNPROCESSABLE_ENTITY, USER_IS_EXISTS, 'REGISTER'));
		}
		this.send(res, HTTPStatusCode.CREATED, {
			email: result.email,
			name: result.name,
			role: result.role,
			id: result.id,
		});
	}

	async info({ email }: Request, res: Response, next: NextFunction): Promise<void> {
		const userInfo = await this.userService.getUserInfo(email);

		this.ok(res, {
			email: userInfo?.email,
			name: userInfo?.name,
			role: userInfo?.role,
			id: userInfo?.id,
		});
	}
	async updateManager(
		{ body }: Request<{}, {}, UserUpdateDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const editedManager = await this.userService.updateManagerPass(body);
		if (!editedManager) {
			return next(new HTTPError(HTTPStatusCode.BAD_REQUEST, USER_IS_NOT_EXIST, 'UPDATE'));
		} else if (editedManager.role === Role.ADMIN) {
			return next(new HTTPError(HTTPStatusCode.FORBIDDEN, USER_IS_NOT_ENOUGH_RIGHTS, 'UPDATE'));
		} else {
			this.send(res, HTTPStatusCode.OK, {
				success: true,
				Manager: {
					name: editedManager.name,
					email: editedManager.email,
					role: editedManager.role,
					id: editedManager.id,
				},
			});
		}
	}

	async deleteManager(
		{ body }: Request<{}, {}, UserRemoveDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const deletedManager = await this.userService.deleteManager(body.email);
		if (!deletedManager) {
			return next(new HTTPError(HTTPStatusCode.BAD_REQUEST, MANAGER_IS_NOT_EXIST, 'DELETE'));
		} else if (deletedManager.role === Role.ADMIN) {
			return next(new HTTPError(HTTPStatusCode.FORBIDDEN, USER_IS_NOT_ENOUGH_RIGHTS, 'DELETE'));
		} else {
			this.send(res, HTTPStatusCode.OK, {
				success: true,
				message: MANAGER_SUCCESSFULLY_REMOVED,
			});
		}
	}

	async createManager(
		{ body }: Request<{}, {}, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const newManager = await this.userService.createManager(body);
		if (body.role === Role.ADMIN) {
			return next(new HTTPError(HTTPStatusCode.FORBIDDEN, USER_IS_NOT_ENOUGH_RIGHTS, 'CREATE'));
		}
		if (!newManager) {
			return next(new HTTPError(HTTPStatusCode.UNPROCESSABLE_ENTITY, USER_IS_EXISTS, 'CREATE'));
		} else {
			this.send(res, HTTPStatusCode.CREATED, {
				email: newManager.email,
				name: newManager.name,
				role: newManager.role,
				id: newManager.id,
			});
		}
	}

	private signJWT(email: string, role: Role, secret: string): Promise<string> {
		return new Promise((resolve, reject) => {
			sign(
				{
					email,
					role,
					iat: Math.floor(Date.now() / 10000),
				},
				secret,
				{
					algorithm: 'HS256',
				},
				(err, token) => {
					if (err) {
						reject(err);
					}
					resolve(token as string);
				},
			);
		});
	}
}
