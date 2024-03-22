import express, { Express } from 'express';
import { Server } from 'http';
import { inject, injectable } from 'inversify';
import { TYPES } from './common/dependency-injection/types';
import { ILogger } from './logger/logger.interface';

@injectable()
export class App {
	app: Express;
	server: Server;
	port: number;
	constructor(@inject(TYPES.ILogger) private logger: ILogger) {
		this.app = express();
		this.port = 8000;
	}
}
