import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PRODUCT_ID_CATEGORY_ERR, PRODUCT_NAME_ERR, PRODUCT_PRICE_ERR } from '../product.msg';

export class ProductFindDto {
	@IsOptional()
	@IsNumber(undefined, { message: PRODUCT_ID_CATEGORY_ERR })
	categoryId?: number;

	@IsOptional()
	@IsString({ message: PRODUCT_NAME_ERR })
	title?: string;

	@IsOptional()
	text?: string;

	@IsNumber(
		{ allowNaN: false, allowInfinity: false },
		{
			message: PRODUCT_PRICE_ERR,
		},
	)
	@IsOptional()
	price?: number;
}
