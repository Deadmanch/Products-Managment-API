import { IsEmail, IsString } from 'class-validator';

export class UserUpdateDto {
	@IsEmail({}, { message: USER_EMAIL_ERR })
	email: string;

	@IsString({ message: USER_PASSWORD_ERR })
	password: string;
}
