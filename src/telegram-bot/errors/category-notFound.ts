import { PRODUCT_NOT_FOUND } from '../scenes/menu/menu-list.dictionary';
import { ProductError } from './product.error';

export class CategoryNotFoundError extends ProductError {
	message: string = PRODUCT_NOT_FOUND;
}
