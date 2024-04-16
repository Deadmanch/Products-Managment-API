import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
	CATEGORY_IS_NOT_EXIST,
	CATEGORY_NAME_ERR,
	CATEGORY_NAME_NOT_SPECIFIED,
	ID_CATEGORY_ERR,
} from '../category.msg';

export class CategoryUpdateDto {
	@IsNumber(
		{ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 },
		{ message: ID_CATEGORY_ERR },
	)
	@IsNotEmpty({ message: CATEGORY_IS_NOT_EXIST })
	id: number;

	@IsString({ message: CATEGORY_NAME_ERR })
	@IsNotEmpty({ message: CATEGORY_NAME_NOT_SPECIFIED })
	name: string;
}
