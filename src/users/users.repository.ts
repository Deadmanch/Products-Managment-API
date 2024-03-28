import { inject, injectable } from 'inversify';
import { TYPES } from '../common/dependency-injection/types';
import { PrismaService } from '../database/prisma.service';
import { IUserRepository } from './interface/user.repository.interface';
import { User } from './user.entity';

@injectable()
export class UserRepository implements IUserRepository {
	constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}
	async create({ email, name, password, role }: User): Promise<User> {
		const createdUserModel = await this.prismaService.client.userModel.create({
			data: {
				email,
				name,
				password,
				role,
			},
		});
		return new User(createdUserModel);
	}

	async find(email: string): Promise<User | null> {
		const foundUserModel = await this.prismaService.client.userModel.findFirst({
			where: {
				email,
			},
		});
		return foundUserModel
			? new User({
					email: foundUserModel.email,
					role: foundUserModel.role,
					name: foundUserModel.name,
					hashPassword: foundUserModel.password,
				})
			: null;
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
