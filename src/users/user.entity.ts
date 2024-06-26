import { Role } from '@prisma/client';
import { compare, hash } from 'bcryptjs';

export class User {
	private readonly _name;
	private readonly _id: number;
	private _password: string;
	private readonly _role;
	private readonly _email;
	private readonly _createdAt: Date;
	private readonly _updatedAt: Date;
	private readonly _isDeleted: boolean = false;

	constructor({
		email,
		hashPassword,
		role,
		name,
		id,
	}: {
		email: string;
		hashPassword?: string;
		role: Role;
		name: string;
		id?: number;
	}) {
		this._email = email;
		this._role = role;
		this._name = name;
		if (hashPassword) {
			this._password = hashPassword;
		}
		if (id) {
			this._id = id;
		}
	}
	get isDeleted(): boolean {
		return this._isDeleted;
	}
	get id(): number {
		return this._id;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}

	get createdAt(): Date {
		return this._createdAt;
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
		return compare(pass, this._password);
	}
}
