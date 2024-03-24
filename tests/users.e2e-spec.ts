import request from 'supertest';
import { App } from '../src/app';
import { HTTPStatusCode } from '../src/common/http.status-code.enum';
import { PrismaService } from '../src/database/prisma.service';
import { UserMsgEnum } from '../src/enums/user.msg.enums';
import { LoggerService } from '../src/logger/logger.service';
import { boot } from '../src/main';

let application: App;
let prismaService: PrismaService;
let adminJWT: string | null | undefined;
let warehouseManagerJWT: string | null | undefined;
let testAdmin: { name: string; email: string; password: string };
let testWarehouseManager: { name: string; email: string; password: string };
let newWarehouseManagerPass: string;

beforeAll(async () => {
	const { app } = await boot;
	prismaService = new PrismaService(new LoggerService());
	testAdmin = {
		name: 'testAdmin',
		email: 'test-admin@mail.ru',
		password: 'qwerty',
	};
	testWarehouseManager = {
		name: 'testWarehouseManager',
		email: 'test-warehouse_manager@mail.ru',
		password: 'qwerty',
	};
	newWarehouseManagerPass = 'qwerty-new';
	application = app;
	await prismaService.connect();
	adminJWT = null;
	warehouseManagerJWT = null;
});

describe('User - e2e', () => {
	it('Register - error - empty name', async () => {
		const res = await request(application.app)
			.post('/users/register')
			.send({ email: testAdmin.email, password: testAdmin.password });
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});
	it('Register = error - empty email', async () => {
		const res = await request(application.app).post('/users/register').send({
			name: testAdmin.name,
			password: testAdmin.password,
		});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Register = error - wrong email', async () => {
		const res = await request(application.app).post('/users/register').send({
			name: testAdmin.name,
			password: testAdmin.password,
			email: '@mail.ru',
		});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});
	it('Register = success', async () => {
		const res = await request(application.app).post('/users/register').send(testAdmin);
		expect(res.statusCode).toBe(HTTPStatusCode.CREATED);
		expect(res.body.email).toBe(testAdmin.email);
	});
	it('Register = user is Exist', async () => {
		const res = await request(application.app).post('/users/register').send(testAdmin);
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
		expect(res.body.err).toBe(UserMsgEnum.USER_IS_EXISTS);
	});

	it('Login - empty email', async () => {
		const res = await request(application.app).post('/users/login').send({
			password: testAdmin.password,
		});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Login - wrong email', async () => {
		const res = await request(application.app).post('/users/login').send({
			password: testAdmin.password,
			email: '@mail.ru',
		});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Login - empty password', async () => {
		const res = await request(application.app).post('/users/login').send({
			email: testAdmin.email,
		});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Login - wrong password type', async () => {
		const res = await request(application.app)
			.post('/users/login')
			.send({
				email: testAdmin.email,
				password: Number(testAdmin.password),
			});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Login - success', async () => {
		const res = await request(application.app).post('/users/login').send({
			email: testAdmin.email,
			password: testAdmin.password,
		});
		expect(res.statusCode).toBe(HTTPStatusCode.OK);
		expect(res.body.jwt).not.toBeUndefined();
		expect(res.body.jwt).not.toBeNull();
		adminJWT = res.body.jwt;
	});

	it('GetUserInfo - success', async () => {
		const res = await request(application.app)
			.get('/users/info')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send();
		expect(res.statusCode).toBe(HTTPStatusCode.OK);
	});

	it('GetUserInfo - unauthorized empty token', async () => {
		const res = await request(application.app)
			.get('/users/info')
			.set('Authorization', 'Bearer')
			.send();
		expect(res.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED);
		expect(res.body.error).toBe(UserMsgEnum.USER_IS_NOT_AUTHORIZED);
	});

	it('Create Warehouse Manager = error empty name', async () => {
		const res = await request(application.app)
			.post('/users/create')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({ email: testWarehouseManager.email, password: testWarehouseManager.password });
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Create Warehouse Manager = error empty email', async () => {
		const res = await request(application.app)
			.post('/users/create')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({ name: testWarehouseManager.name, password: testWarehouseManager.password });
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Create Warehouse Manager = error wrong email', async () => {
		const res = await request(application.app)
			.post('/users/create')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				name: testWarehouseManager.name,
				password: testWarehouseManager.password,
				email: '@mail.ru',
			});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Create Warehouse Manager = success', async () => {
		const res = await request(application.app)
			.post('/users/create')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send(testWarehouseManager);
		expect(res.statusCode).toBe(HTTPStatusCode.CREATED);
	});

	it('Create Warehouse Manager = error User is existed', async () => {
		const res = await request(application.app)
			.post('/users/create')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send(testWarehouseManager);
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
		expect(res.body.err).toBe(UserMsgEnum.USER_IS_EXISTS);
	});

	it('Login Warehouse manager - success', async () => {
		const res = await request(application.app).post('/users/login').send({
			email: testWarehouseManager.email,
			password: testWarehouseManager.password,
			name: testWarehouseManager.name,
		});
		expect(res.statusCode).toBe(HTTPStatusCode.OK);
		expect(res.body.jwt).not.toBeUndefined();
		expect(res.body.jwt).not.toBeNull();
		warehouseManagerJWT = res.body.jwt;
	});

	it('Update Warehouse Manager password - FORBIDDEN', async () => {
		const res = await request(application.app)
			.patch('/users/update')
			.set('Authorization', 'Bearer ' + warehouseManagerJWT)
			.send({
				email: testWarehouseManager.email,
				password: testWarehouseManager.password,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.FORBIDDEN);
		expect(res.body.error).toBe(UserMsgEnum.USER_IS_NOT_ENOUGH_RIGHTS);
	});

	it('Update Warehouse Manager password - empty email', async () => {
		const res = await request(application.app)
			.patch('/users/update')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				password: testWarehouseManager.password,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Update Warehouse Manager password - wrong email', async () => {
		const res = await request(application.app)
			.patch('/users/update')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				email: '@mail.ru',
				password: testWarehouseManager.password,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Update Warehouse Manager password - empty password', async () => {
		const res = await request(application.app)
			.patch('/users/update')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				email: testWarehouseManager.email,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});
	it('Update Warehouse Manager password - success', async () => {
		const res = await request(application.app)
			.patch('/users/update')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				email: testWarehouseManager.email,
				password: newWarehouseManagerPass,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.OK);
	});

	it('Delete Warehouse Manager error - empty email', async () => {
		const res = await request(application.app)
			.delete('/users/delete')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send();
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Delete Warehouse Manager error - wrong email', async () => {
		const res = await request(application.app)
			.delete('/users/delete')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				email: '@mail.ru',
			});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Delete Warehouse Manager error - FORBIDDEN', async () => {
		const res = await request(application.app)
			.delete('/users/delete')
			.set('Authorization', 'Bearer ' + warehouseManagerJWT)
			.send({
				email: testWarehouseManager.email,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.FORBIDDEN);
		expect(res.body.error).toBe(UserMsgEnum.USER_IS_NOT_ENOUGH_RIGHTS);
	});

	it('Delete Warehouse Manager  - success', async () => {
		const res = await request(application.app)
			.delete('/users/delete')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				email: testWarehouseManager.email,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.OK);
		expect(res.body.message).toBe(UserMsgEnum.WAREHOUSE_MANAGER_SUCCESSFULLY_REMOVED);
	});
});

afterAll(async () => {
	await prismaService.client.userModel.delete({
		where: {
			email: testAdmin.email,
		},
	});
	await prismaService.disconnect();
	application.close();
});
