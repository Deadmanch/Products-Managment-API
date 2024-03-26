declare namespace Express {
	export interface Request {
		email: string;
		role: 'ADMIN' | 'WAREHOUSE_MANAGER';
	}
}
