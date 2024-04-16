import { IsEmail } from 'class-validator';
import { USER_EMAIL_ERR } from '../user.msg';

export class UserRemoveDto {
	@IsEmail({}, { message: USER_EMAIL_ERR })
	email: string;
}
