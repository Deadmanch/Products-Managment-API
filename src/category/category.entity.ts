import { CategoryModel } from '@prisma/client';

export class Category {
	readonly name;
	readonly id: number;
	readonly isDeleted: boolean = false;

	constructor(prismaModel: CategoryModel) {
		this.name = prismaModel.name;
		this.id = prismaModel.id;
		this.isDeleted = prismaModel.isDeleted;
	}
}
