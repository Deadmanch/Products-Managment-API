import { Prisma } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { TYPES } from '../common/dependency-injection/types';
import { PrismaService } from '../database/prisma.service';
import { IProductRepository } from './interface/products.repository.interface';
import { Product } from './product.entity';
import { PRODUCT_DEFAULT_OFFSET } from './product.msg';
import { ProductCreateType } from './type/product-create.type';
import { ProductFindType } from './type/product-find.type';
@injectable()
export class ProductRepository implements IProductRepository {
	constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}

	async create(product: ProductCreateType): Promise<Product> {
		const categoryConnect: Prisma.CategoryModelWhereUniqueInput | undefined =
			product.categoryId !== null ? { id: product.categoryId } : undefined;
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

	async find({ categoryId, title, text, price, page = 1 }: ProductFindType): Promise<Product[]> {
		const where: Prisma.ProductModelWhereInput = {};

		if (categoryId) {
			where.categoryId = categoryId;
		}
		if (title) {
			where.title = { contains: title };
		}
		if (text) {
			where.OR = [{ title: { contains: text } }, { description: { contains: text } }];
		}
		if (price) {
			where.price = price;
		}

		const offset = (page - 1) * PRODUCT_DEFAULT_OFFSET;
		const products = await this.prismaService.client.productModel.findMany({
			where,
			skip: offset,
			take: PRODUCT_DEFAULT_OFFSET,
		});
		return products.map((product) => new Product(product));
	}

	async getById(productId: number): Promise<Product | null> {
		const foundProduct = await this.prismaService.client.productModel.findUnique({
			where: {
				id: productId,
			},
		});
		return foundProduct ? new Product(foundProduct) : null;
	}

	async getProductListByIds(productIds: number[]): Promise<Product[]> {
		const foundProducts = await this.prismaService.client.productModel.findMany({
			where: {
				id: {
					in: productIds,
				},
				quantity: {
					gt: 0,
				},
			},
		});
		return foundProducts.map((product) => new Product(product));
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
