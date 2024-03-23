import { NextFunction, Request, Response } from 'express';

export interface IUserController {
	login: (req: Request, res: Response, next: NextFunction) => void;
	register: (req: Request, res: Response, next: NextFunction) => void;
	createWarehouseManager: (req: Request, res: Response, next: NextFunction) => void;
	info: (req: Request, res: Response, next: NextFunction) => void;
	updateWarehouseManager: (req: Request, res: Response, next: NextFunction) => void;
	deleteWarehouseManager: (req: Request, res: Response, next: NextFunction) => void;
}
