import request from 'supertest';
import { App } from '../src/app';
import { HTTPStatusCode } from '../src/common/http.status-code.enum';
import {
	MANAGER_IS_NOT_EXIST,
	MANAGER_SUCCESSFULLY_REMOVED,
	USER_IS_EXISTS,
	USER_IS_NOT_AUTHORIZED,
	USER_IS_NOT_ENOUGH_RIGHTS,
	USER_IS_NOT_EXIST,
} from '../src/constants/user.msg';
import { PrismaService } from '../src/database/prisma.service';
import { LoggerService } from '../src/logger/logger.service';
import { boot } from '../src/main';

let application: App;
let prismaService: PrismaService;
let adminJWT: string | null | undefined;
let ManagerJWT: string | null | undefined;
let testAdmin: { name: string; email: string; password: string };
let testManager: { name: string; email: string; password: string };
let newManagerPass: string;

beforeAll(async () => {
	const { app } = await boot;
	prismaService = new PrismaService(new LoggerService());
	testAdmin = {
		name: 'testAdmin',
		email: 'test-admin@mail.ru',
		password: 'qwerty',
	};
	testManager = {
		name: 'testWarehouseManager',
		email: 'test-warehouse_manager@mail.ru',
		password: 'qwerty',
	};
	newManagerPass = 'qwerty-new';
	application = app;
	await prismaService.connect();
	adminJWT = null;
	ManagerJWT = null;
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
		expect(res.body.err).toBe(USER_IS_EXISTS);
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
	it('Login - error user is not exist', async () => {
		const res = await request(application.app).post('/users/login').send({
			email: 'test@mail.ru',
			password: testAdmin.password,
		});
		expect(res.statusCode).toBe(HTTPStatusCode.BAD_REQUEST);
		expect(res.body.err).toBe(USER_IS_NOT_EXIST);
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
		expect(res.body.error).toBe(USER_IS_NOT_AUTHORIZED);
	});

	it('Create Manager = error empty name', async () => {
		const res = await request(application.app)
			.post('/users/create')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({ email: testManager.email, password: testManager.password });
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Create Manager = error empty email', async () => {
		const res = await request(application.app)
			.post('/users/create')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({ name: testManager.name, password: testManager.password });
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Create Manager = error wrong email', async () => {
		const res = await request(application.app)
			.post('/users/create')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				name: testManager.name,
				password: testManager.password,
				email: '@mail.ru',
			});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Create Manager = success', async () => {
		const res = await request(application.app)
			.post('/users/create')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send(testManager);
		expect(res.statusCode).toBe(HTTPStatusCode.CREATED);
	});

	it('Create Manager = error User is existed', async () => {
		const res = await request(application.app)
			.post('/users/create')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send(testManager);
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
		expect(res.body.err).toBe(USER_IS_EXISTS);
	});

	it('Login manager - success', async () => {
		const res = await request(application.app).post('/users/login').send({
			email: testManager.email,
			password: testManager.password,
			name: testManager.name,
		});
		expect(res.statusCode).toBe(HTTPStatusCode.OK);
		expect(res.body.jwt).not.toBeUndefined();
		expect(res.body.jwt).not.toBeNull();
		ManagerJWT = res.body.jwt;
	});

	it('Update Manager password - FORBIDDEN', async () => {
		const res = await request(application.app)
			.patch('/users/update')
			.set('Authorization', 'Bearer ' + ManagerJWT)
			.send({
				email: testManager.email,
				password: testManager.password,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.FORBIDDEN);
		expect(res.body.error).toBe(USER_IS_NOT_ENOUGH_RIGHTS);
	});

	it('Update Manager password - empty email', async () => {
		const res = await request(application.app)
			.patch('/users/update')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				password: testManager.password,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Update Manager password - wrong email', async () => {
		const res = await request(application.app)
			.patch('/users/update')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				email: '@mail.ru',
				password: testManager.password,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Update Manager password - empty password', async () => {
		const res = await request(application.app)
			.patch('/users/update')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				email: testManager.email,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Update Manager password - user is not exist', async () => {
		const res = await request(application.app)
			.patch('/users/update')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				email: 'test@mail.ru',
				password: testManager.password,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.BAD_REQUEST);
		expect(res.body.err).toBe(USER_IS_NOT_EXIST);
	});

	it('Update Manager password - success', async () => {
		const res = await request(application.app)
			.patch('/users/update')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				email: testManager.email,
				password: newManagerPass,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.OK);
	});

	it('Delete Manager error - empty email', async () => {
		const res = await request(application.app)
			.delete('/users/delete')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send();
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Delete Manager error - wrong email', async () => {
		const res = await request(application.app)
			.delete('/users/delete')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				email: '@mail.ru',
			});
		expect(res.statusCode).toBe(HTTPStatusCode.UNPROCESSABLE_ENTITY);
	});

	it('Delete Manager error - FORBIDDEN', async () => {
		const res = await request(application.app)
			.delete('/users/delete')
			.set('Authorization', 'Bearer ' + ManagerJWT)
			.send({
				email: testManager.email,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.FORBIDDEN);
		expect(res.body.error).toBe(USER_IS_NOT_ENOUGH_RIGHTS);
	});

	it('Delete Manager error - user is not exist', async () => {
		const res = await request(application.app)
			.delete('/users/delete')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				email: 'test@mail.ru',
			});
		expect(res.statusCode).toBe(HTTPStatusCode.BAD_REQUEST);
		expect(res.body.err).toBe(MANAGER_IS_NOT_EXIST);
	});

	it('Delete Manager  - success', async () => {
		const res = await request(application.app)
			.delete('/users/delete')
			.set('Authorization', 'Bearer ' + adminJWT)
			.send({
				email: testManager.email,
			});
		expect(res.statusCode).toBe(HTTPStatusCode.OK);
		expect(res.body.message).toBe(MANAGER_SUCCESSFULLY_REMOVED);
	});
});

afterAll(async () => {
	await prismaService.disconnect();
	application.close();
});
