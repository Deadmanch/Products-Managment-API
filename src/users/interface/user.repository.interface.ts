import { User } from '../user.entity';

export interface IUserRepository {
	create: (user: User) => Promise<User>;
	find: (email: string) => Promise<User | null>;
	update: (email: string, password: string) => Promise<User | null>;
	delete: (email: string) => Promise<User | null>;
}
