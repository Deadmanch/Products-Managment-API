import { PRODUCT_OUT_OF_WAREHOUSE } from '../../scenes/menu/menu-list.dictionary';
import { ProductError } from './product.error';

export class ProductOutError extends ProductError {
	message: string = PRODUCT_OUT_OF_WAREHOUSE;
}
