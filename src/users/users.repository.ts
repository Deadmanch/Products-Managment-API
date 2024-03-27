import { inject, injectable } from 'inversify';
import { TYPES } from '../common/dependency-injection/types';
import { PrismaService } from '../database/prisma.service';
import { IUserRepository } from './interface/user.repository.interface';
import { User } from './user.entity';

@injectable()
export class UserRepository implements IUserRepository {
	constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}
	async create({ email, name, password, role }: User): Promise<User> {
		const newUser = new User({
			email,
			hashPassword: password,
			name,
			role,
		});
		const createdUser = await this.prismaService.client.userModel.create({
			data: {
				id: newUser.id,
				email: newUser.email,
				password: newUser.password,
				name: newUser.name,
				role: newUser.role,
				createdAt: newUser.createdAt,
				updatedAt: newUser.updatedAt,
				isDeleted: newUser.isDeleted,
			},
		});
		return new User(createdUser);
	}

	async find(email: string): Promise<User | null> {
		const foundUserModel = await this.prismaService.client.userModel.findFirst({
			where: {
				email,
			},
		});
		return foundUserModel ? new User(foundUserModel) : null;
	}

	async update(email: string, password: string): Promise<User | null> {
		const updatedUserModel = await this.prismaService.client.userModel.update({
			data: {
				password,
			},
			where: {
				email,
			},
		});
		return updatedUserModel ? new User(updatedUserModel) : null;
	}

	async delete(email: string): Promise<User | null> {
		const deletedUserModel = await this.prismaService.client.userModel.update({
			where: {
				email,
			},
			data: {
				isDeleted: true,
			},
		});
		return deletedUserModel ? new User(deletedUserModel) : null;
	}
}
