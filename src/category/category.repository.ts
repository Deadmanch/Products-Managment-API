import { inject, injectable } from 'inversify';
import { TYPES } from '../common/dependency-injection/types';
import { PrismaService } from '../database/prisma.service';
import { Category } from './category.entity';
import { CATEGORY_DEFAULT_OFFSET } from './category.msg';
import { ICategoryRepository } from './interface/category.repository.interface';
import { CategoryCreateType } from './type/category-create.type';
@injectable()
export class CategoryRepository implements ICategoryRepository {
	constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}

	async create({ name }: { name: string }): Promise<Category> {
		const createdCategory = await this.prismaService.client.categoryModel.create({
			data: {
				name,
			},
		});
		return new Category(createdCategory);
	}

	async find({ name }: CategoryCreateType): Promise<Category | null> {
		const category = await this.prismaService.client.categoryModel.findFirst({
			where: {
				name: { contains: name },
			},
		});
		return category ? new Category(category) : null;
	}

	async getCategories(page = 1): Promise<Category[]> {
		const offset = (page - 1) * CATEGORY_DEFAULT_OFFSET;
		const categories = await this.prismaService.client.categoryModel.findMany({
			skip: offset,
			take: CATEGORY_DEFAULT_OFFSET,
		});
		return categories.map((category) => new Category(category));
	}

	async getById(categoryId: number): Promise<Category | null> {
		const existingCategory = await this.prismaService.client.categoryModel.findUnique({
			where: { id: categoryId },
		});

		if (!existingCategory) {
			return null;
		}
		const foundCategory = await this.prismaService.client.categoryModel.findUnique({
			where: {
				id: categoryId,
			},
		});
		return foundCategory ? new Category(foundCategory) : null;
	}

	async update(categoryId: number, data: Category): Promise<Category | null> {
		const existingCategory = await this.prismaService.client.categoryModel.findUnique({
			where: { id: categoryId },
		});

		if (!existingCategory) {
			return null;
		}
		const updatedCategoryModel = await this.prismaService.client.categoryModel.update({
			data,
			where: {
				id: categoryId,
			},
		});
		return updatedCategoryModel ? new Category(updatedCategoryModel) : null;
	}

	async delete(categoryId: number): Promise<Category | null> {
		const existingCategory = await this.prismaService.client.categoryModel.findUnique({
			where: { id: categoryId },
		});

		if (!existingCategory) {
			return null;
		}
		const deletedCategoryModel = await this.prismaService.client.categoryModel.update({
			where: {
				id: categoryId,
			},
			data: {
				isDeleted: true,
			},
		});
		return deletedCategoryModel ? new Category(deletedCategoryModel) : null;
	}
}
