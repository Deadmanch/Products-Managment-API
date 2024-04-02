import { IsNotEmpty, IsNumber } from 'class-validator';
import {
	ID_PRODUCT_ERR,
	PRODUCT_IS_NOT_EXIST,
	PRODUCT_QUANTITY_ERR,
} from '../../constants/product.msg';

export class ProductEditCountDto {
	@IsNumber(
		{ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
		{ message: ID_PRODUCT_ERR },
	)
	@IsNotEmpty({ message: PRODUCT_IS_NOT_EXIST })
	id: number;

	@IsNumber(
		{ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
		{ message: PRODUCT_QUANTITY_ERR },
	)
	@IsNotEmpty()
	quantity: number;
}
