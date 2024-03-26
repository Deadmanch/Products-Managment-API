import { IsEmail, IsString } from 'class-validator';
import { USER_EMAIL_ERR, USER_NAME_ERR, USER_PASSWORD_ERR } from '../../enums/user.msg';

export class UserRegisterDto {
	@IsEmail({}, { message: USER_EMAIL_ERR })
	email: string;

	@IsString({ message: USER_PASSWORD_ERR })
	password: string;

	@IsString({ message: USER_NAME_ERR })
	name: string;
}
