import { Decimal } from '@prisma/client/runtime/library';
import { IsDecimal, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import {
	PRODUCT_DESCRIPTION_ERR,
	PRODUCT_ID_CATEGORY_ERR,
	PRODUCT_NAME_ERR,
	PRODUCT_NAME_NOT_SPECIFIED,
	PRODUCT_PRICE_ERR,
	PRODUCT_PRICE_NOT_SPECIFIED,
	PRODUCT_QUANTITY_ERR,
} from '../../constants/product.msg';

export class ProductCreateDto {
	@IsString({ message: PRODUCT_NAME_ERR })
	@IsNotEmpty({ message: PRODUCT_NAME_NOT_SPECIFIED })
	title: string;

	@IsNumber(
		{ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
		{ message: PRODUCT_QUANTITY_ERR },
	)
	quantity: number;

	@IsOptional()
	@IsNumber({}, { message: PRODUCT_ID_CATEGORY_ERR })
	categoryId?: number;

	@IsOptional()
	@IsString({ message: PRODUCT_DESCRIPTION_ERR })
	description?: string;

	@IsDecimal({}, { message: PRODUCT_PRICE_ERR })
	@IsNotEmpty({ message: PRODUCT_PRICE_NOT_SPECIFIED })
	price: Decimal;
}
