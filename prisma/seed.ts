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

		const categories = [
			{
				name: 'Круассаны - Сэндвичи',
			},
			{
				name: 'Сладкие круассаны',
			},
			{
				name: 'Напитки',
			},
		];
		const products = [
			{
				title: 'Вегетарианский',
				description: 'круассан, соус песто, руккола, Помидор, Сыр моцарелла, вяленые томаты',
				quantity: 10,
				price: 350,
			},
			{
				title: 'Чизбургер',
				description:
					'круассан, говяжья котлета, сыр тостовый, салат айсберг, помидор, квашеный огурец, лук сушеный, соус острый / соус бургерный',
				quantity: 13,
				price: 400,
			},
			{
				title: 'Дабл Чизбургер',
				description:
					'круассан, говяжья котлета, сыр тостовый, салат айсберг, помидор, квашеный огурец, лук сушеный, соус острый / соус бургерный',
				quantity: 7,
				price: 500,
			},

			{
				title: 'С миндальным кремом',
				description: 'круассан, крем миндальный, миндальные хлопья, сахарная пудра',
				quantity: 7,
				price: 450,
			},

			{
				title: 'С шоколадом и бананом',
				description: 'круассан, шоколад, банан, сахарная пудра',
				quantity: 7,
				price: 500,
			},

			{
				title: 'Пьяная вишня',
				description: 'круассан, конфитюр "Пьяная вишня", крем маскарпоне, какао, сахарная пудра',
				quantity: 7,
				price: 600,
			},

			{
				title: 'Крем – Латте “Сникерс”',
				quantity: 7,
				price: 150,
			},

			{
				title: 'Крем-латте "Соленая карамель"',
				quantity: 7,
				price: 150,
			},

			{
				title: 'Чай витаминный "апельсиновый с мятой"',
				quantity: 7,
				price: 120,
			},
		];
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
		await this.#prisma.categoryModel.createMany({
			data: categories,
		});
		await this.#prisma.productModel.createMany({
			data: products,
		});
		await this.#prisma.$disconnect();
	}
}
new Seed().load();
