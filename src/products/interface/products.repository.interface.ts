import { Product } from '../product.entity';
import { ProductFindType } from '../type/product-find.type';

export interface IProductRepository {
	create: (product: Product) => Promise<Product>;
	find: (findModel: ProductFindType) => Promise<Product[]>;
	getById: (productId: number) => Promise<Product | null>;
	update: (productId: number, product: Product) => Promise<Product | null>;
	delete: (productId: number) => Promise<Product | null>;
	editQuantity: (productId: number, quantity: number) => Promise<Product | null>;
	getProductListByIds(productIds: number[]): Promise<Product[]>;
}
