import { Decimal } from '@prisma/client/runtime/library';
import { IsDecimal, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import {
	ID_PRODUCT_ERR,
	ID_PRODUCT_NOT_SPECIFIED,
	PRODUCT_DESCRIPTION_ERR,
	PRODUCT_ID_CATEGORY_ERR,
	PRODUCT_NAME_ERR,
	PRODUCT_PRICE_ERR,
} from '../../constants/product.msg';

export class ProductUpdateDto {
	@IsOptional()
	@IsString({ message: PRODUCT_NAME_ERR })
	title?: string;

	@IsOptional()
	@IsNumber(undefined, { message: PRODUCT_ID_CATEGORY_ERR })
	categoryId?: number;

	@IsOptional()
	@IsString({ message: PRODUCT_DESCRIPTION_ERR })
	description?: string;

	@IsNumber(
		{ allowNaN: false, allowInfinity: false },
		{
			message: PRODUCT_PRICE_ERR,
		},
	)
	@IsOptional()
	@IsDecimal({}, { message: PRODUCT_PRICE_ERR })
	price?: Decimal;

	@IsNumber(
		{ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
		{ message: ID_PRODUCT_ERR },
	)
	@IsNotEmpty({ message: ID_PRODUCT_NOT_SPECIFIED })
	id: number;
}
