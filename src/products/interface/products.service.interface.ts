import { Product } from '../product.entity';
import { ProductCreateType } from '../type/product-create.type';
import { ProductEditCountType } from '../type/product-edit-count.type';
import { ProductFindType } from '../type/product-find.type';

export interface IProductService {
	createProduct: (data: ProductCreateType) => Promise<Product | null>;
	findProduct: (data: ProductFindType) => Promise<Product[]>;
	getProductById: (productId: number) => Promise<Product | null>;
	updateProduct: (productId: number, data: Product) => Promise<Product | null>;
	deleteProduct: (productId: number) => Promise<Product | null>;
	editProductCount: (dto: ProductEditCountType) => Promise<Product | null>;
}
