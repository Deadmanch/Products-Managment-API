import { Role } from '@prisma/client';
import { compare, hash } from 'bcryptjs';

export class User {
	private readonly _name;
	private _password: string;
	private readonly _role;
	private readonly _email;

	constructor({
		email,
		hashPassword,
		role,
		name,
	}: {
		email: string;
		hashPassword?: string;
		role: Role;
		name: string;
	}) {
		this._email = email;
		this._role = role;
		this._name = name;
		if (hashPassword) {
			this._password = hashPassword;
		}
	}

	get email(): string {
		return this._email;
	}

	get role(): Role {
		return this._role;
	}

	get name(): string {
		return this._name;
	}

	get password(): string {
		return this._password;
	}

	async setPassword(pass: string, salt: number): Promise<void> {
		this._password = await hash(pass, salt);
	}
	async comparePassword(pass: string): Promise<boolean> {
		return await compare(pass, this._password);
	}
}
