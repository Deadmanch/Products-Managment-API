import request from 'supertest';
import { App } from '../src/app';
import { CATEGORY_IS_NOT_EXIST } from '../src/category/category.msg';
import { HTTPStatusCode } from '../src/common/http.status-code.enum';
import { PrismaService } from '../src/database/prisma.service';
import { LoggerService } from '../src/logger/logger.service';
import { boot } from '../src/main';
import {
	ADMIN_CREDENTIALS,
	CATEGORY_DATA,
	MANAGER_CREDENTIALS,
	NEW_CATEGORY_NAME,
} from './test-variables';

let application: App;
let jwtAdmin: string;
let jwtManager: string;
let categoryId: number;
let prismaService: PrismaService;

beforeAll(async () => {
	const { app } = await boot;
	prismaService = new PrismaService(new LoggerService());
	application = app;
	await prismaService.connect();
	const loginAdmin = await request(application.app).post('/users/login').send(ADMIN_CREDENTIALS);
	jwtAdmin = loginAdmin.body.jwt;

	const loginManager = await request(application.app)
		.post('/users/login')
		.send(MANAGER_CREDENTIALS);
	jwtManager = loginManager.body.jwt;
});

describe('Category e2e', () => {
	it('Create new Category - error - unauthorized user', async () => {
		const res = await request(application.app).post('/category/create').send(CATEGORY_DATA);
		expect(res.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
	});

	it('Create new Category by Manager - error - FORBIDDEN', async () => {
		const res = await request(application.app)
			.post('/category/create')
			.set('Authorization', `Bearer ${jwtManager}`)
			.send(CATEGORY_DATA);
		expect(res.statusCode).toBe(HTTPStatusCode.FORBIDDEN);
	});

	it('Create new Category - error - empty title', async () => {
		const res = await request(application.app)
			.post('/category/create')
			.set('Authorization', `Bearer ${jwtAdmin}`)
			.send();
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Create new Category - success', async () => {
		const res = await request(application.app)
			.post('/category/create')
			.set('Authorization', `Bearer ${jwtAdmin}`)
			.send(CATEGORY_DATA);
		expect(res.statusCode).toBe(HTTPStatusCode.CREATED);
	});

	it('Find Category - error - unauthorized user', async () => {
		const res = await request(application.app)
			.post('/category/find')
			.set('Authorization', `Bearer `)
			.send({
				name: CATEGORY_DATA.name,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
	});

	it('Find Category - success ', async () => {
		const res = await request(application.app)
			.post('/category/find')
			.set('Authorization', `Bearer ${jwtManager}`)
			.send(CATEGORY_DATA);
		expect(res.statusCode).toBe(HTTPStatusCode.OK);
		categoryId = res.body.id;
	});

	it('Get by ID - error - Category not Found ', async () => {
		const res = await request(application.app)
			.get('/category/detail')
			.set('Authorization', `Bearer ${jwtManager}`)
			.send({
				id: -1,
			});

		expect(res.statusCode).toBe(HTTPStatusCode.BAD_REQUEST);
		expect(res.body.err).toBe(CATEGORY_IS_NOT_EXIST);
	});

	it('Get by ID - success', async () => {
		const res = await request(application.app)
			.get(`/category/detail`)
			.set('Authorization', `Bearer ${jwtManager}`)
			.send({
				id: categoryId,
			});

		expect(res.statusCode).toBe(HTTPStatusCode.OK);
	});

	it('Update Category - error - unauthorized user', async () => {
		const res = await request(application.app)
			.patch(`/category/update`)
			.set('Authorization', `Bearer `);

		expect(res.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
	});

	it('Update Category by Manager - error - FORBIDDEN', async () => {
		const res = await request(application.app)
			.patch(`/category/update`)
			.set('Authorization', `Bearer ${jwtManager}`);
		expect(res.statusCode).toBe(HTTPStatusCode.FORBIDDEN);
	});

	it('Update Category  - error - Category not Found', async () => {
		const res = await request(application.app)
			.patch(`/category/update`)
			.set('Authorization', `Bearer ${jwtAdmin}`)
			.send({
				id: -1,
				name: NEW_CATEGORY_NAME,
			});

		expect(res.statusCode).toBe(HTTPStatusCode.BAD_REQUEST);
		expect(res.body.err).toBe(CATEGORY_IS_NOT_EXIST);
	});

	it('Update Category  - success', async () => {
		const res = await request(application.app)
			.patch(`/category/update`)
			.set('Authorization', `Bearer ${jwtAdmin}`)
			.send({
				id: categoryId,
				name: NEW_CATEGORY_NAME,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.OK);
		const res2 = await request(application.app)
			.get(`/category/detail`)
			.set('Authorization', `Bearer ${jwtAdmin}`)
			.send({
				id: categoryId,
			});

		expect(res2.body.name).toEqual(NEW_CATEGORY_NAME);
	});
	it('Delete Category - error - unauthorized user', async () => {
		const res = await request(application.app)
			.delete(`/category/delete`)
			.set('Authorization', `Bearer `);

		expect(res.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
	});

	it('Delete Category by Manager - error - FORBIDDEN', async () => {
		const res = await request(application.app)
			.delete(`/category/delete`)
			.set('Authorization', `Bearer ${jwtManager}`);

		expect(res.statusCode).toBe(HTTPStatusCode.FORBIDDEN);
	});

	it('Delete Category  - error - Category not Found', async () => {
		const res = await request(application.app)
			.delete(`/category/delete`)
			.set('Authorization', `Bearer ${jwtAdmin}`)
			.send({
				id: -1,
			});

		expect(res.statusCode).toBe(HTTPStatusCode.BAD_REQUEST);
		expect(res.body.err).toBe(CATEGORY_IS_NOT_EXIST);
	});

	it('Delete Category  - success', async () => {
		const res = await request(application.app)
			.delete(`/category/delete`)
			.set('Authorization', `Bearer ${jwtAdmin}`)
			.send({
				id: categoryId,
			});

		expect(res.statusCode).toBe(HTTPStatusCode.OK);
	});
});

afterAll(async () => {
	await prismaService.client.categoryModel.delete({
		where: {
			id: categoryId,
		},
	});
	await prismaService.disconnect();
	application.close();
});
