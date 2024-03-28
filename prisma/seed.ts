import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import { config } from 'dotenv';

export default class Seed {
	#prisma: PrismaClient;

	constructor() {
		this.#prisma = new PrismaClient();
	}

	public async load(): Promise<void> {
		const admin = {
			name: 'Администратор Данил',
			email: 'admin@gmail.com',
			password: 'qwerty',
			role: Role.ADMIN,
		};
		const warehouseManager = {
			name: 'Начальник склада Валентин',
			email: 'warehouse@gmail.com',
			password: 'qwerty',
			role: Role.WAREHOUSE_MANAGER,
		};
		await this.#prisma.$connect();
		const result = config();
		const env = result.parsed;

		if (result.error || !env) {
			console.error('Не удалось прочитать файл .env или он отсутствует');
			throw Error('Не удалось прочитать файл .env или он отсутствует');
		}
		admin.password = await hash(admin.password, Number(env['SALT']));
		warehouseManager.password = await hash(warehouseManager.password, Number(env['SALT']));
		await this.#prisma.userModel.createMany({
			data: [admin, warehouseManager],
		});
		await this.#prisma.$disconnect();
	}
}
new Seed().load();
