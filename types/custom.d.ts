declare namespace Express {
	export interface Request {
		user: string;
		role: 'ADMIN' | 'WAREHOUSE_MANAGER';
	}
}
