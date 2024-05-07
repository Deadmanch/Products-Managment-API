import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { BaseController } from '../common/base.controller';
import { TYPES } from '../common/dependency-injection/types';
import { HTTPStatusCode } from '../common/http.status-code.enum';
import { AuthGuard } from '../common/middlewares/auth/auth.guard';
import { PermissionGuard } from '../common/middlewares/permission.guard';
import { ValidateMiddleware } from '../common/middlewares/validate.middleware';
import { HTTPError } from '../errors/http-errors';
import { ILogger } from '../logger/logger.interface';
import { CATEGORY_IS_NOT_EXIST, CREATE_CATEGORY_ERR, FIND_CATEGORY_ERR } from './category.msg';
import { CategoryCreateDto } from './dto/category-create.dto';
import { CategoryDeleteDto } from './dto/category-delete.dto';
import { CategoryUpdateDto } from './dto/category-update.dto';
import { ICategoryController } from './interface/category.controller.interface';
import { ICategoryService } from './interface/category.service.interface';

@injectable()
export class CategoryController extends BaseController implements ICategoryController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.CategoryService) private categoryService: ICategoryService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/create',
				method: 'post',
				func: this.create,
				middlewares: [
					new AuthGuard(),
					new PermissionGuard([Role.ADMIN]),
					new ValidateMiddleware(CategoryCreateDto),
				],
			},
			{
				path: '/find',
				method: 'post',
				func: this.find,
				middlewares: [new AuthGuard(), new ValidateMiddleware(CategoryCreateDto)],
			},
			{
				path: '/detail',
				method: 'get',
				func: this.getById,
				middlewares: [new AuthGuard(), new ValidateMiddleware(CategoryDeleteDto)],
			},
			{
				path: '/update',
				method: 'patch',
				func: this.update,
				middlewares: [
					new AuthGuard(),
					new PermissionGuard([Role.ADMIN]),
					new ValidateMiddleware(CategoryUpdateDto),
				],
			},
			{
				path: '/delete',
				method: 'delete',
				func: this.delete,
				middlewares: [
					new AuthGuard(),
					new PermissionGuard([Role.ADMIN]),
					new ValidateMiddleware(CategoryDeleteDto),
				],
			},
		]);
	}

	async create(
		{ body }: Request<{}, {}, CategoryCreateDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const newCategory = await this.categoryService.createCategory(body);
		if (!newCategory) {
			return next(
				new HTTPError(HTTPStatusCode.BAD_REQUEST, CREATE_CATEGORY_ERR, 'Create_Category'),
			);
		}
		this.send(res, HTTPStatusCode.CREATED, {
			name: newCategory.name,
			id: newCategory.id,
		});
	}

	async find(
		{ body }: Request<{}, {}, CategoryCreateDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const category = await this.categoryService.findCategory(body);
		if (!category) {
			return next(new HTTPError(HTTPStatusCode.BAD_REQUEST, FIND_CATEGORY_ERR, 'Find_Category'));
		}
		this.ok(res, {
			name: category.name,
			id: category.id,
		});
	}

	async getById({ body }: Request, res: Response, next: NextFunction): Promise<void> {
		const category = await this.categoryService.getCategoryById(body.id);
		if (!category) {
			return next(
				new HTTPError(HTTPStatusCode.BAD_REQUEST, CATEGORY_IS_NOT_EXIST, 'GetById - Category'),
			);
		}
		this.ok(res, {
			name: category.name,
			id: category.id,
		});
	}

	async update({ body }: Request, res: Response, next: NextFunction): Promise<void> {
		const category = await this.categoryService.updateCategory(body.id, body);
		if (!category) {
			return next(
				new HTTPError(HTTPStatusCode.BAD_REQUEST, CATEGORY_IS_NOT_EXIST, 'Update_Category'),
			);
		}
		this.send(res, HTTPStatusCode.OK, {
			success: true,
			UpdatedCategory: { name: category.name, id: category.id },
		});
	}

	async delete({ body }: Request, res: Response, next: NextFunction): Promise<void> {
		const category = await this.categoryService.deleteCategory(body.id);
		if (!category) {
			return next(
				new HTTPError(HTTPStatusCode.BAD_REQUEST, CATEGORY_IS_NOT_EXIST, 'Delete_Category'),
			);
		}
		this.send(res, HTTPStatusCode.OK, {
			success: true,
			data: { name: category.name, id: category.id },
		});
	}
}
