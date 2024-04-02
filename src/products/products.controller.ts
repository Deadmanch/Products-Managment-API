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
import {
	CREATE_PRODUCT_ERR,
	FIND_PRODUCTS_ERR,
	PRODUCT_IS_NOT_EXIST,
} from '../constants/product.msg';
import { HTTPError } from '../errors/http-errors';
import { ILogger } from '../logger/logger.interface';
import { ProductCreateDto } from './dto/product-create.dto';
import { ProductDeleteDto } from './dto/product-delete.dto';
import { ProductEditCountDto } from './dto/product-edit-count.dto';
import { ProductFindDto } from './dto/product-find.dto';
import { ProductUpdateDto } from './dto/product-update.dto';
import { IProductController } from './interface/products.controller.interface';
import { IProductService } from './interface/products.service.interface';

@injectable()
export class ProductController extends BaseController implements IProductController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.ProductService) private productService: IProductService,
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
					new ValidateMiddleware(ProductCreateDto),
				],
			},
			{
				path: '/find',
				method: 'post',
				func: this.find,
				middlewares: [new AuthGuard(), new ValidateMiddleware(ProductFindDto)],
			},
			{
				path: '/detail',
				method: 'get',
				func: this.getById,
				middlewares: [new AuthGuard(), new ValidateMiddleware(ProductDeleteDto)],
			},
			{
				path: '/update',
				method: 'patch',
				func: this.update,
				middlewares: [
					new AuthGuard(),
					new ValidateMiddleware(ProductUpdateDto),
					new PermissionGuard([Role.ADMIN]),
				],
			},
			{
				path: '/delete',
				method: 'delete',
				func: this.delete,
				middlewares: [
					new AuthGuard(),
					new PermissionGuard([Role.ADMIN]),
					new ValidateMiddleware(ProductDeleteDto),
				],
			},
			{
				path: '/update/count',
				method: 'patch',
				func: this.changeProductCount,
				middlewares: [
					new AuthGuard(),
					new PermissionGuard([Role.WAREHOUSE_MANAGER]),
					new ValidateMiddleware(ProductEditCountDto),
				],
			},
		]);
	}

	async create(
		{ body }: Request<{}, {}, ProductCreateDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const newProduct = await this.productService.createProduct(body);
		if (!newProduct) {
			return next(new HTTPError(HTTPStatusCode.BAD_REQUEST, CREATE_PRODUCT_ERR, 'Create_Product'));
		}
		this.send(res, HTTPStatusCode.CREATED, {
			title: newProduct.title,
			id: newProduct.id,
			description: newProduct.description,
			price: newProduct.price,
			quantity: newProduct.quantity,
			categoryId: newProduct.categoryId,
		});
	}

	async find(
		{ body }: Request<{}, {}, ProductFindDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const products = await this.productService.findProduct(body);
		if (!products) {
			return next(new HTTPError(HTTPStatusCode.BAD_REQUEST, FIND_PRODUCTS_ERR, 'Find_Product'));
		}
		const respProd = products.map((product) => {
			return {
				title: product.title,
				id: product.id,
				description: product.description,
				price: product.price,
				quantity: product.quantity,
				categoryId: product.categoryId,
			};
		});
		this.ok(res, respProd);
	}

	async getById({ body }: Request, res: Response, next: NextFunction): Promise<void> {
		const product = await this.productService.getProductById(body.id);
		if (!product) {
			return next(new HTTPError(HTTPStatusCode.BAD_REQUEST, PRODUCT_IS_NOT_EXIST, 'GetById'));
		}
		this.ok(res, {
			title: product.title,
			id: product.id,
			description: product.description,
			price: product.price,
			quantity: product.quantity,
			categoryId: product.categoryId,
		});
	}

	async update({ body }: Request, res: Response, next: NextFunction): Promise<void> {
		const product = await this.productService.updateProduct(body.id, body);
		if (!product) {
			return next(
				new HTTPError(HTTPStatusCode.BAD_REQUEST, PRODUCT_IS_NOT_EXIST, 'Update_Product'),
			);
		}
		this.send(res, HTTPStatusCode.OK, {
			success: true,
			UpdatedProduct: {
				title: product.title,
				id: product.id,
				description: product.description,
				price: product.price,
				quantity: product.quantity,
				categoryId: product.categoryId,
			},
		});
	}

	async delete({ body }: Request, res: Response, next: NextFunction): Promise<void> {
		const product = await this.productService.deleteProduct(body.id);
		if (!product) {
			return next(
				new HTTPError(HTTPStatusCode.BAD_REQUEST, PRODUCT_IS_NOT_EXIST, 'Delete_Product'),
			);
		}
		this.send(res, HTTPStatusCode.OK, {
			success: true,
			DeletedProduct: {
				title: product.title,
				id: product.id,
				description: product.description,
				price: product.price,
				quantity: product.quantity,
				categoryId: product.categoryId,
			},
		});
	}

	async changeProductCount(
		{ body }: Request<{}, {}, ProductEditCountDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const product = await this.productService.editProductCount(body);
		if (!product) {
			return next(
				new HTTPError(HTTPStatusCode.BAD_REQUEST, PRODUCT_IS_NOT_EXIST, 'Edit_Count_Product'),
			);
		}
		this.send(res, HTTPStatusCode.OK, {
			success: true,
			ChangedProductCount: {
				title: product.title,
				id: product.id,
				description: product.description,
				price: product.price,
				quantity: product.quantity,
				categoryId: product.categoryId,
			},
		});
	}
}
