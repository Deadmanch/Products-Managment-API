import { UserModel } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { TYPES } from '../common/dependency-injection/types';
import { PrismaService } from '../database/prisma.service';
import { IUserRepository } from './interface/user.repository.interface';
import { User } from './user.entity';

@injectable()
export class UserRepository implements IUserRepository {
	constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}
	async create({ email, password, name, role }: User): Promise<UserModel> {
		return this.prismaService.client.userModel.create({
			data: {
				email,
				password,
				name,
				role,
			},
		});
	}

	async find(email: string): Promise<UserModel | null> {
		return this.prismaService.client.userModel.findFirst({
			where: {
				email,
			},
		});
	}

	async update(email: string, password: string): Promise<UserModel | null> {
		return this.prismaService.client.userModel.update({
			data: {
				password,
			},
			where: {
				email,
				role: 'WAREHOUSE_MANAGER',
			},
		});
	}

	async delete(email: string): Promise<UserModel | null> {
		return this.prismaService.client.userModel.delete({
			where: {
				email,
			},
		});
	}
}
