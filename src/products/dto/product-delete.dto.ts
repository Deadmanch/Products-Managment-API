import { IsNotEmpty, IsNumber } from 'class-validator';
import { ID_PRODUCT_ERR, ID_PRODUCT_NOT_SPECIFIED } from '../product.msg';

export class ProductDeleteDto {
	@IsNumber(
		{ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
		{ message: ID_PRODUCT_ERR },
	)
	@IsNotEmpty({ message: ID_PRODUCT_NOT_SPECIFIED })
	id: number;
}
