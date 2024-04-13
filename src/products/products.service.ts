import { ProductModel } from '@prisma/client';
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
	async findProduct(findModel: ProductFindType): Promise<ProductModel[]> {
		return this.productRepository.find(findModel);
	}

	async getProductById(productId: number): Promise<ProductModel | null> {
		return this.productRepository.getById(productId);
	}

	async createProduct(product: ProductCreateType): Promise<ProductModel | null> {
		const newProduct = new Product({
			title: product.title,
			description: product.description || null,
			price: product.price,
			quantity: product.quantity,
			categoryId: product.categoryId || null,
		});
		return this.productRepository.create(newProduct);
	}

	async updateProduct(productId: number, product: Product): Promise<ProductModel | null> {
		return this.productRepository.update(productId, product);
	}

	async deleteProduct(productId: number): Promise<ProductModel | null> {
		return this.productRepository.delete(productId);
	}

	async editProductCount(prodData: ProductEditCountType): Promise<ProductModel | null> {
		return this.productRepository.editQuantity(prodData.id, prodData.quantity);
	}
}
