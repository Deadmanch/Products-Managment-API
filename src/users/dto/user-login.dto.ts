import { IsEmail } from 'class-validator';
import { UserMsgEnum } from '../../enums/user.msg.enums';

export class UserLoginDto {
	@IsEmail({}, { message: UserMsgEnum.USER_EMAIL_ERR })
	email: string;

	@IsString()
	password: string;
}
