import request from 'supertest';
import { App } from '../src/app';
import { HTTPStatusCode } from '../src/common/http.status-code.enum';
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
		expect(res.body.err).toBe('Пользователь с таким email уже существует');
	});
});

afterAll(async () => {
	application.close();
});
