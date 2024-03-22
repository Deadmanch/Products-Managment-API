import { IsEmail, IsString } from 'class-validator';
import { UserMsgEnum } from '../../enums/user.msg.enums';

export class UserRegisterDto {
	@IsEmail({}, { message: UserMsgEnum.USER_EMAIL_ERR })
	email: string;

	@IsString({ message: UserMsgEnum.USER_PASSWORD_ERR })
	password: string;

	@IsString({ message: UserMsgEnum.USER_NAME_ERR })
	name: string;
}
