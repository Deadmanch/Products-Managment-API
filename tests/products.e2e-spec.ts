import request from 'supertest';
import { App } from '../src/app';
import { HTTPStatusCode } from '../src/common/http.status-code.enum';
import { PRODUCT_IS_NOT_EXIST } from '../src/constants/product.msg';
import { PrismaService } from '../src/database/prisma.service';
import { LoggerService } from '../src/logger/logger.service';
import { boot } from '../src/main';
import {
	ADMIN_CREDENTIALS,
	MANAGER_CREDENTIALS,
	NEW_PRODUCT_QUANTITY,
	NEW_PRODUCT_TITLE,
	PRODUCT_DATA,
} from './test-variables';

let application: App;
let jwtAdmin: string;
let jwtManager: string;
let productId: number;
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

describe('Products e2e', () => {
	it('Create new Product - error - unauthorized user', async () => {
		const res = await request(application.app).post('/product/create').send(PRODUCT_DATA);
		expect(res.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
	});

	it('Create new Product by Manager - error - FORBIDDEN', async () => {
		const res = await request(application.app)
			.post('/product/create')
			.set('Authorization', `Bearer ${jwtManager}`)
			.send(PRODUCT_DATA);
		expect(res.statusCode).toBe(HTTPStatusCode.FORBIDDEN);
	});

	it('Create new Product - error - empty title', async () => {
		const res = await request(application.app)
			.post('/product/create')
			.set('Authorization', `Bearer ${jwtAdmin}`)
			.send({
				description: PRODUCT_DATA.description,
				price: PRODUCT_DATA.price,
				quantity: PRODUCT_DATA.quantity,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Create new Product - success', async () => {
		const res = await request(application.app)
			.post('/product/create')
			.set('Authorization', `Bearer ${jwtAdmin}`)
			.send(PRODUCT_DATA);
		expect(res.statusCode).toBe(HTTPStatusCode.CREATED);
	});

	it('Find Product - error - unauthorized user', async () => {
		const res = await request(application.app)
			.post('/product/find')
			.set('Authorization', `Bearer `)
			.send({
				title: PRODUCT_DATA.title,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
	});

	it('Find Product - success ', async () => {
		const res = await request(application.app)
			.post('/product/find')
			.set('Authorization', `Bearer ${jwtManager}`)
			.send({
				title: PRODUCT_DATA.title,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.OK);
		const product = res.body[0];
		expect(product).toMatchObject(PRODUCT_DATA);
		productId = product.id;
	});

	it('Get by ID - error - Product not Found ', async () => {
		const res = await request(application.app)
			.get('/product/detail')
			.set('Authorization', `Bearer ${jwtManager}`)
			.send({
				id: -1,
			});

		expect(res.statusCode).toBe(HTTPStatusCode.BAD_REQUEST);
		expect(res.body.err).toBe(PRODUCT_IS_NOT_EXIST);
	});

	it('Get by ID - success', async () => {
		const res = await request(application.app)
			.get(`/product/detail`)
			.set('Authorization', `Bearer ${jwtManager}`)
			.send({
				id: productId,
			});

		expect(res.statusCode).toBe(HTTPStatusCode.OK);
	});

	it('Update Product - error - unauthorized user', async () => {
		const res = await request(application.app)
			.patch(`/product/update`)
			.set('Authorization', `Bearer `);

		expect(res.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
	});

	it('Update Product by Manager - error - FORBIDDEN', async () => {
		const res = await request(application.app)
			.patch(`/product/update`)
			.set('Authorization', `Bearer ${jwtManager}`)
			.send({
				id: productId,
			});

		expect(res.statusCode).toBe(HTTPStatusCode.FORBIDDEN);
	});

	it('Update Product  - error - Product not Found', async () => {
		const res = await request(application.app)
			.patch(`/product/update`)
			.set('Authorization', `Bearer ${jwtAdmin}`)
			.send({
				id: -1,
			});

		expect(res.statusCode).toBe(HTTPStatusCode.BAD_REQUEST);
		expect(res.body.err).toBe(PRODUCT_IS_NOT_EXIST);
	});

	it('Update Product  - success', async () => {
		const res = await request(application.app)
			.patch(`/product/update`)
			.set('Authorization', `Bearer ${jwtAdmin}`)
			.send({
				id: productId,
				title: NEW_PRODUCT_TITLE,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.OK);
		const res2 = await request(application.app)
			.get(`/product/detail`)
			.set('Authorization', `Bearer ${jwtAdmin}`)
			.send({
				id: productId,
			});

		expect(res2.body.title).toEqual(NEW_PRODUCT_TITLE);
	});
	it('Delete Product - error - unauthorized user', async () => {
		const res = await request(application.app)
			.delete(`/product/delete`)
			.set('Authorization', `Bearer `);

		expect(res.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
	});

	it('Delete Product by Manager - error - FORBIDDEN', async () => {
		const res = await request(application.app)
			.delete(`/product/delete`)
			.set('Authorization', `Bearer ${jwtManager}`);

		expect(res.statusCode).toBe(HTTPStatusCode.FORBIDDEN);
	});

	it('Delete Product  - error - Product not Found', async () => {
		const res = await request(application.app)
			.delete(`/product/delete`)
			.set('Authorization', `Bearer ${jwtAdmin}`)
			.send({
				id: -1,
			});

		expect(res.statusCode).toBe(HTTPStatusCode.BAD_REQUEST);
		expect(res.body.err).toBe(PRODUCT_IS_NOT_EXIST);
	});

	it('Delete Product  - success', async () => {
		const res = await request(application.app)
			.delete(`/product/delete`)
			.set('Authorization', `Bearer ${jwtAdmin}`)
			.send({
				id: productId,
			});

		expect(res.statusCode).toBe(HTTPStatusCode.OK);
	});

	it('Update Product Count - error - unauthorized user', async () => {
		const res = await request(application.app)
			.patch(`/product/update/count`)
			.set('Authorization', `Bearer `);

		expect(res.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
	});

	it('Update Product Count by Admin - error - FORBIDDEN', async () => {
		const res = await request(application.app)
			.patch(`/product/update/count`)
			.set('Authorization', `Bearer ${jwtAdmin}`);

		expect(res.statusCode).toBe(HTTPStatusCode.FORBIDDEN);
	});

	it('Update Product Count  - error - Product not Found', async () => {
		const res = await request(application.app)
			.patch(`/product/update/count`)
			.set('Authorization', `Bearer ${jwtManager}`)
			.send({
				id: -1,
				quantity: NEW_PRODUCT_QUANTITY,
			});

		expect(res.statusCode).toBe(HTTPStatusCode.BAD_REQUEST);
		expect(res.body.err).toBe(PRODUCT_IS_NOT_EXIST);
	});

	it('Update Product Count  - success', async () => {
		const res = await request(application.app)
			.patch(`/product/update/count`)
			.set('Authorization', `Bearer ${jwtManager}`)
			.send({
				id: productId,
				quantity: NEW_PRODUCT_QUANTITY,
			});

		expect(res.statusCode).toBe(HTTPStatusCode.OK);

		const res2 = await request(application.app)
			.get(`/product/detail`)
			.set('Authorization', `Bearer ${jwtAdmin}`)
			.send({
				id: productId,
			});

		expect(res2.body.quantity).toEqual(NEW_PRODUCT_QUANTITY);
	});
});

afterAll(async () => {
	await prismaService.client.productModel.delete({
		where: {
			id: productId,
		},
	});
	await prismaService.disconnect();
	application.close();
});
