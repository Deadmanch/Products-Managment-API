import { IsEmail, IsOptional, IsString } from 'class-validator';
import { UserMsgEnum } from '../../enums/user.msg.enums';

export class UserUpdateDto {
	@IsOptional()
	@IsEmail({}, { message: UserMsgEnum.USER_EMAIL_ERR })
	email: string;

	@IsOptional()
	@IsString({ message: UserMsgEnum.USER_PASSWORD_ERR })
	password: string;
}
