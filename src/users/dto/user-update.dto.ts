import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserMsgEnum } from '../../enums/user.msg.enums';

export class UserUpdateDto {
	@IsOptional()
	@IsEmail({}, { message: UserMsgEnum.USER_EMAIL_ERR })
	email: string;

	@IsOptional()
	@IsString({ message: UserMsgEnum.USER_PASSWORD_ERR })
	password: string;

	@IsOptional()
	@IsString({ message: UserMsgEnum.USER_NAME_ERR })
	name: string;

	@IsOptional()
	@IsEnum(Role)
	role: Role;
}
