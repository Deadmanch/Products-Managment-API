import { IsNotEmpty, IsString } from 'class-validator';
import { CATEGORY_NAME_ERR, CATEGORY_NAME_NOT_SPECIFIED } from '../../constants/category.msg';

export class CategoryCreateDto {
	@IsString({ message: CATEGORY_NAME_ERR })
	@IsNotEmpty({ message: CATEGORY_NAME_NOT_SPECIFIED })
	name: string;
}
