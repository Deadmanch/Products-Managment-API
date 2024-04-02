import { CategoryModel } from '@prisma/client';
import { Category } from '../category.entity';
import { CategoryCreateType } from '../type/category-create.type';

export interface ICategoryService {
	createCategory: (createModel: CategoryCreateType) => Promise<CategoryModel | null>;
	findCategory: (findModel: CategoryCreateType) => Promise<CategoryModel | null>;
	getCategoryById: (categoryId: number) => Promise<CategoryModel | null>;
	updateCategory: (categoryId: number, category: Category) => Promise<CategoryModel | null>;
	deleteCategory: (categoryId: number) => Promise<CategoryModel | null>;
}
