import { Role, UserModel } from '@prisma/client';
import { hash } from 'bcryptjs';
import { inject, injectable } from 'inversify';
import { TYPES } from '../common/dependency-injection/types';
import { IConfigService } from '../config/config.service.interface';
import { IUserRepository } from './interface/user.repository.interface';
import { IUserService } from './interface/user.service.interface';
import { UserLoginType } from './type/user-login.type';
import { UserRegisterType } from './type/user-register.type';
import { User } from './user.entity';

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.UsersRepository) private userRepository: IUserRepository,
	) {}
	async register({ name, email, password }: UserRegisterType): Promise<UserModel | null> {
		const newUser = new User({
			email,
			role: Role.ADMIN,
			name,
		});
		const salt = this.configService.get('SALT');
		await newUser.setPassword(password, Number(salt));
		const existedUser = await this.userRepository.find(email);
		if (existedUser) {
			return null;
		}
		return this.userRepository.create(newUser);
	}

	async validateUser({ email, password }: UserLoginType): Promise<boolean> {
		const existedUser = await this.userRepository.find(email);
		if (!existedUser) {
			return false;
		}
		const newUser = new User({
			email: existedUser.email,
			role: existedUser.role,
			name: existedUser.name,
			hashPassword: existedUser.password,
		});
		return newUser.comparePassword(password);
	}

	async getUserInfo(email: string): Promise<UserModel | null> {
		return this.userRepository.find(email);
	}
	async createWarehouseManager({
		email,
		password,
		name,
	}: UserRegisterType): Promise<UserModel | null> {
		const existedUser = await this.userRepository.find(email);
		if (existedUser) {
			return null;
		}
		const newUser = new User({
			email,
			role: Role.WAREHOUSE_MANAGER,
			name,
		});
		const salt = this.configService.get('SALT');
		await newUser.setPassword(password, Number(salt));
		return this.userRepository.create(newUser);
	}

	async updateWarehouseManagerPass({ email, password }: UserLoginType): Promise<UserModel | null> {
		const existedUser = await this.userRepository.find(email);
		if (!existedUser) {
			return null;
		}
		const salt = this.configService.get('SALT');
		existedUser.password = await hash(password, Number(salt));
		return this.userRepository.update(email, existedUser.password);
	}

	async deleteWarehouseManager(email: string): Promise<UserModel | null> {
		return this.userRepository.delete(email);
	}
}
