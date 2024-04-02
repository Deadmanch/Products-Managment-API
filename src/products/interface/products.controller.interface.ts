import { NextFunction, Request, Response } from 'express';

export interface IProductController {
	create: (req: Request, res: Response, next: NextFunction) => void;
	find: (req: Request, res: Response, next: NextFunction) => void;
	getById: (req: Request, res: Response, next: NextFunction) => void;
	update: (req: Request, res: Response, next: NextFunction) => void;
	delete: (req: Request, res: Response, next: NextFunction) => void;
	changeProductCount: (req: Request, res: Response, next: NextFunction) => void;
}
