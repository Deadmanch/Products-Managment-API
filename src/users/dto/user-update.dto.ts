import { IsEmail, IsString } from 'class-validator';
import { USER_EMAIL_ERR, USER_PASSWORD_ERR } from '../user.msg';

export class UserUpdateDto {
	@IsEmail({}, { message: USER_EMAIL_ERR })
	email: string;

	@IsString({ message: USER_PASSWORD_ERR })
	password: string;
}
