import { NextFunction, Request, Response } from 'express';

export interface IUserController {
	login: (req: Request, res: Response, next: NextFunction) => void;
	register: (req: Request, res: Response, next: NextFunction) => void;
	createManager: (req: Request, res: Response, next: NextFunction) => void;
	info: (req: Request, res: Response, next: NextFunction) => void;
	updateManager: (req: Request, res: Response, next: NextFunction) => void;
	deleteManager: (req: Request, res: Response, next: NextFunction) => void;
}
