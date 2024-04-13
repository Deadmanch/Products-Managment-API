import express, { Express } from 'express';
import { Server } from 'http';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { CategoryController } from './category/category.controller';
import { TYPES } from './common/dependency-injection/types';
import { AuthMiddleware } from './common/middlewares/auth/auth.middleware';
import { IConfigService } from './config/config.service.interface';
import { PrismaService } from './database/prisma.service';
import { IExceptionFilter } from './errors/exception.filter.interface';
import { ILogger } from './logger/logger.interface';
import { ProductController } from './products/products.controller';
import { Bot } from './telegram-bot/bot';
import { UserController } from './users/users.controller';

@injectable()
export class App {
	app: Express;
	server: Server;
	port: number;

	constructor(
		@inject(TYPES.ILogger) private logger: ILogger,
		@inject(TYPES.ExceptionFilter) private exceptionFilter: IExceptionFilter,
		@inject(TYPES.PrismaService) private prismaService: PrismaService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.UserController) private userController: UserController,
		@inject(TYPES.ProductController) private productController: ProductController,
		@inject(TYPES.CategoryController) private categoryController: CategoryController,
		@inject(TYPES.Bot) private bot: Bot,
	) {
		this.app = express();
		this.port = Number(this.configService.get('SERVER_PORT'));
	}
	useMiddleware(): void {
		this.app.use(express.json());
		const authMiddleware = new AuthMiddleware(this.configService.get('SECRET'));
		this.app.use(authMiddleware.execute.bind(authMiddleware));
	}
	async useRoutes(): Promise<void> {
		this.app.use('/users', this.userController.router);
		this.app.use('/product', this.productController.router);
		this.app.use('/category', this.categoryController.router);
	}

	useExceptionFilter(): void {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
	}
	useBot(): void {
		this.bot.init();
	}

	public async init(): Promise<void> {
		this.useMiddleware();
		await this.useRoutes();
		this.useExceptionFilter();
		await this.prismaService.connect();
		this.useBot();
		this.server = this.app.listen(this.port);
		this.logger.log(`Сервер запущен на http://localhost:${this.port}`);
	}

	public close(): void {
		this.server.close();
	}
}
