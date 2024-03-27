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
	private SALT: number;
	constructor(
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.UsersRepository) private userRepository: IUserRepository,
	) {
		this.SALT = Number(this.configService.get('SALT'));
	}
	async register({ name, email, password }: UserRegisterType): Promise<UserModel | null> {
		const hashedPassword = await hash(password, this.SALT);
		const newUser = new User({
			email,
			hashPassword: hashedPassword,
			role: Role.ADMIN,
			name,
		});
		const existedUser = await this.userRepository.find(email);
		if (existedUser) {
			return null;
		}
		const createdUser = await this.userRepository.create(newUser);
		return createdUser;
	}

	async validateUser({ email, password }: UserLoginType): Promise<boolean> {
		const existedUser = await this.userRepository.find(email);
		if (!existedUser) {
			return false;
		}
		console.log("Retrieved user's password from DB:", existedUser);
		return existedUser.comparePassword(password);
	}

	async getUserInfo(email: string): Promise<UserModel | null> {
		return this.userRepository.find(email);
	}
	async createManager({
		email,
		password,
		name,
		role,
	}: UserRegisterType): Promise<UserModel | null> {
		const existedUser = await this.userRepository.find(email);
		if (existedUser) {
			return null;
		}
		if (role === Role.ADMIN) {
			return null;
		}
		const newUser = new User({
			email,
			role,
			name,
		});
		await newUser.setPassword(password, this.SALT);
		return this.userRepository.create(newUser);
	}

	async updateManagerPass({ email, password }: UserLoginType): Promise<UserModel | null> {
		const existedUser = await this.userRepository.find(email);
		if (!existedUser) {
			return null;
		}
		await existedUser.setPassword(password, this.SALT);
		return this.userRepository.update(email, existedUser.password);
	}

	async deleteManager(email: string): Promise<UserModel | null> {
		const existedUser = await this.userRepository.find(email);
		if (!existedUser) {
			return null;
		}
		return this.userRepository.delete(email);
	}
}
