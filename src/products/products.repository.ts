import { Prisma } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { TYPES } from '../common/dependency-injection/types';
import { PrismaService } from '../database/prisma.service';
import { IProductRepository } from './interface/products.repository.interface';
import { Product } from './product.entity';
import { ProductFindType } from './type/product-find.type';
@injectable()
export class ProductRepository implements IProductRepository {
	constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}

	async create(product: Product): Promise<Product> {
		const categoryConnect =
			product.categoryId !== null
				? ({ id: product.categoryId } as Prisma.CategoryModelWhereUniqueInput)
				: undefined;
		const createdProduct = await this.prismaService.client.productModel.create({
			data: {
				title: product.title,
				price: product.price,
				quantity: product.quantity,
				description: product.description || null,

				category: {
					connect: categoryConnect,
				},
			},
		});
		return new Product(createdProduct);
	}

	async find(findModel: ProductFindType): Promise<Product[]> {
		const where: Prisma.ProductModelWhereInput = {};

		if (findModel.categoryId) {
			where.categoryId = findModel.categoryId;
		}
		if (findModel.title) {
			where.title = { contains: findModel.title };
		}
		if (findModel.text) {
			where.OR = [
				{ title: { contains: findModel.text } },
				{ description: { contains: findModel.text } },
			];
		}
		if (findModel.price) {
			where.price = findModel.price;
		}
		const offset = findModel.page && findModel.page > 0 ? (findModel.page - 1) * 10 : 0;
		const products = await this.prismaService.client.productModel.findMany({
			where,
			skip: offset,
			take: 10,
		});
		return products.map((product) => new Product(product));
	}

	async getById(productId: number): Promise<Product | null> {
		const foundProduct = await this.prismaService.client.productModel.findUnique({
			where: {
				id: productId,
			},
		});
		return foundProduct
			? new Product({
					title: foundProduct.title,
					description: foundProduct.description,
					price: foundProduct.price,
					quantity: foundProduct.quantity,
					categoryId: foundProduct.categoryId,
				})
			: null;
	}

	async update(productId: number, data: Product): Promise<Product | null> {
		const existingProduct = await this.prismaService.client.productModel.findUnique({
			where: { id: productId },
		});

		if (!existingProduct) {
			return null;
		}
		const updatedProductModel = await this.prismaService.client.productModel.update({
			where: {
				id: productId,
			},
			data,
		});
		return updatedProductModel ? new Product(updatedProductModel) : null;
	}

	async delete(productId: number): Promise<Product | null> {
		const existingProduct = await this.prismaService.client.productModel.findUnique({
			where: { id: productId },
		});

		if (!existingProduct) {
			return null;
		}
		const deletedProductModel = await this.prismaService.client.productModel.update({
			where: {
				id: productId,
			},
			data: {
				isDeleted: true,
			},
		});
		return deletedProductModel ? new Product(deletedProductModel) : null;
	}

	async editQuantity(productId: number, quantity: number): Promise<Product | null> {
		const existingProduct = await this.prismaService.client.productModel.findUnique({
			where: { id: productId },
		});

		if (!existingProduct) {
			return null;
		}
		const editedQuantityProductModel = await this.prismaService.client.productModel.update({
			where: {
				id: productId,
			},
			data: {
				quantity,
			},
		});

		return editedQuantityProductModel ? new Product(editedQuantityProductModel) : null;
	}
}
