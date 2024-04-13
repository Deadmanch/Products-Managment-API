import { CategoryModel } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { TYPES } from '../common/dependency-injection/types';
import { Category } from './category.entity';
import { ICategoryRepository } from './interface/category.repository.interface';
import { ICategoryService } from './interface/category.service.interface';
import { CategoryCreateType } from './type/category-create.type';

@injectable()
export class CategoryService implements ICategoryService {
	constructor(@inject(TYPES.CategoryRepository) private categoryRepository: ICategoryRepository) {}
	async createCategory({ name }: CategoryCreateType): Promise<CategoryModel | null> {
		const newCategory = new Category({ name });
		const existedCategory = await this.categoryRepository.find({ name });
		if (existedCategory) {
			return null;
		}
		return this.categoryRepository.create(newCategory);
	}

	async findCategory(findModel: CategoryCreateType): Promise<CategoryModel | null> {
		return this.categoryRepository.find(findModel);
	}

	async getCategoryById(categoryId: number): Promise<CategoryModel | null> {
		return this.categoryRepository.getById(categoryId);
	}

	async updateCategory(categoryId: number, category: Category): Promise<CategoryModel | null> {
		return this.categoryRepository.update(categoryId, category);
	}

	async deleteCategory(categoryId: number): Promise<CategoryModel | null> {
		return this.categoryRepository.delete(categoryId);
	}
}
