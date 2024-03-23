import { UserModel } from '@prisma/client';
import { User } from '../user.entity';

export interface IUserRepository {
	create: (user: User) => Promise<UserModel>;
	find: (email: string) => Promise<UserModel | null>;
	update: (email: string, password: string) => Promise<UserModel | null>;
	delete: (email: string) => Promise<UserModel | null>;
}
