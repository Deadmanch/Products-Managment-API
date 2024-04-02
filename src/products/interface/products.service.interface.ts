import { ProductModel } from '@prisma/client';
import { ProductCreateDto } from '../dto/product-create.dto';
import { Product } from '../product.entity';
import { ProductEditCountType } from '../type/product-edit-count.type';
import { ProductFindType } from '../type/product-find.type';

export interface IProductService {
	createProduct: (dto: ProductCreateDto) => Promise<ProductModel | null>;
	findProduct: (dto: ProductFindType) => Promise<ProductModel[]>;
	getProductById: (productId: number) => Promise<ProductModel | null>;
	updateProduct: (productId: number, data: Product) => Promise<ProductModel | null>;
	deleteProduct: (productId: number) => Promise<ProductModel | null>;
	editProductCount: (dto: ProductEditCountType) => Promise<ProductModel | null>;
}
