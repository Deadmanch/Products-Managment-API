import { IsEmail } from 'class-validator';
import { USER_EMAIL_ERR } from '../../constants/user.msg';

export class UserRemoveDto {
	@IsEmail({}, { message: USER_EMAIL_ERR })
	email: string;
}
