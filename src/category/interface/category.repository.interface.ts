import { Category } from '../category.entity';
import { CategoryCreateType } from '../type/category-create.type';

export interface ICategoryRepository {
	create: (category: Category) => Promise<Category | null>;
	find: (findModel: CategoryCreateType) => Promise<Category | null>;
	getById: (categoryId: number) => Promise<Category | null>;
	update: (categoryId: number, category: Category) => Promise<Category | null>;
	delete: (categoryId: number) => Promise<Category | null>;
}
