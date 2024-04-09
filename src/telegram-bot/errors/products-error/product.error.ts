import { PRODUCT_ERROR } from '../../scenes/menu/menu-list.dictionary';

export class ProductError extends Error {
	message: string = PRODUCT_ERROR;
}
