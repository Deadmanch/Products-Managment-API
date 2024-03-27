import { UserModel } from '@prisma/client';
import { UserLoginType } from '../type/user-login.type';
import { UserRegisterType } from '../type/user-register.type';

export interface IUserService {
	register: (registerModel: UserRegisterType) => Promise<UserModel | null>;
	createManager: (managerModel: UserRegisterType) => Promise<UserModel | null>;
	validateUser: (validateModel: UserLoginType) => Promise<boolean>;
	getUserInfo: (email: string) => Promise<UserModel | null>;
	updateManagerPass: (managerModel: UserLoginType) => Promise<UserModel | null>;
	deleteManager: (email: string) => Promise<UserModel | null>;
}
