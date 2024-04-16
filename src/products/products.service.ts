import { inject, injectable } from 'inversify';
import { TYPES } from '../common/dependency-injection/types';
import { IProductRepository } from './interface/products.repository.interface';
import { IProductService } from './interface/products.service.interface';
import { Product } from './product.entity';
import { ProductCreateType } from './type/product-create.type';
import { ProductEditCountType } from './type/product-edit-count.type';
import { ProductFindType } from './type/product-find.type';

@injectable()
export class ProductService implements IProductService {
	constructor(@inject(TYPES.ProductRepository) private productRepository: IProductRepository) {}
	async findProduct(findModel: ProductFindType): Promise<Product[]> {
		return this.productRepository.find(findModel);
	}

	async getProductById(productId: number): Promise<Product | null> {
		return this.productRepository.getById(productId);
	}

	async createProduct(data: ProductCreateType): Promise<Product | null> {
		return this.productRepository.create(data);
	}

	async updateProduct(productId: number, product: Product): Promise<Product | null> {
		return this.productRepository.update(productId, product);
	}

	async deleteProduct(productId: number): Promise<Product | null> {
		return this.productRepository.delete(productId);
	}

	async editProductCount(prodData: ProductEditCountType): Promise<Product | null> {
		return this.productRepository.editQuantity(prodData.id, prodData.quantity);
	}
}
