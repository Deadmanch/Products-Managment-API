import { Role } from '@prisma/client';

export type UserRegisterType = {
	name: string;
	email: string;
	password: string;
	role: Role;
};
