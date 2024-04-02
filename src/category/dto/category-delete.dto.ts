import { IsNotEmpty, IsNumber } from 'class-validator';
import { CATEGORY_IS_NOT_EXIST, ID_CATEGORY_ERR } from '../../constants/category.msg';

export class CategoryDeleteDto {
	@IsNumber(
		{ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
		{ message: ID_CATEGORY_ERR },
	)
	@IsNotEmpty({ message: CATEGORY_IS_NOT_EXIST })
	id: number;
}
