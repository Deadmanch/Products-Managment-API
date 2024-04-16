import { Product } from '../product.entity';
import { ProductCreateType } from '../type/product-create.type';
import { ProductFindType } from '../type/product-find.type';

export interface IProductRepository {
	create: (data: ProductCreateType) => Promise<Product>;
	find: (findParameters: ProductFindType) => Promise<Product[]>;
	getById: (productId: number) => Promise<Product | null>;
	update: (productId: number, product: Product) => Promise<Product | null>;
	delete: (productId: number) => Promise<Product | null>;
	editQuantity: (productId: number, quantity: number) => Promise<Product | null>;
	getProductListByIds(productIds: number[]): Promise<Product[]>;
}
