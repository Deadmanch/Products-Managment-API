import { IsEmail } from 'class-validator';
import { USER_EMAIL_ERR } from '../../enums/user.msg';

export class UserRemoveDto {
	@IsEmail({}, { message: USER_EMAIL_ERR })
	email: string;
}
