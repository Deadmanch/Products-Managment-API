import request from 'supertest';
import { App } from '../src/app';
import { HTTPStatusCode } from '../src/common/http.status-code.enum';
import { UserMsgEnum } from '../src/enums/user.msg.enums';
import { boot } from '../src/main';

let application: App;
let adminJWT: string | null | undefined;
let warehouseManagerJWT: string | null | undefined;
let testAdmin: { name: string; email: string; password: string };
let testWarehouseManager: { name: string; email: string; password: string };
let newWarehouseManagerPass: string;

beforeAll(async () => {
	const { app } = await boot;
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
});

afterAll(async () => {
	application.close();
});
