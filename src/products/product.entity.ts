import { ProductModel } from '@prisma/client';

export class Product {
	readonly title;
	readonly id: number;
	readonly description: string | null;
	readonly categoryId: number | null;
	readonly quantity;
	readonly price;
	readonly createdAt: Date;
	readonly updatedAt: Date;
	readonly isDeleted: boolean = false;

	constructor(prismaModel: ProductModel) {
		this.title = prismaModel.title;
		this.id = prismaModel.id;
		this.description = prismaModel.description;
		this.categoryId = prismaModel.categoryId;
		this.quantity = prismaModel.quantity;
		this.price = prismaModel.price;
		this.createdAt = prismaModel.createdAt;
		this.updatedAt = prismaModel.updatedAt;
		this.isDeleted = prismaModel.isDeleted;
	}
}
