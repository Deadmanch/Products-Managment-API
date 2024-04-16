import { Category } from '../category.entity';
import { CategoryCreateType } from '../type/category-create.type';

export interface ICategoryService {
	createCategory: (createModel: CategoryCreateType) => Promise<Category | null>;
	findCategory: (findModel: CategoryCreateType) => Promise<Category | null>;
	getCategoryById: (categoryId: number) => Promise<Category | null>;
	updateCategory: (categoryId: number, category: Category) => Promise<Category | null>;
	deleteCategory: (categoryId: number) => Promise<Category | null>;
}
