import { Container, ContainerModule, interfaces } from 'inversify';
import { App } from './app';
import { CategoryController } from './category/category.controller';
import { CategoryRepository } from './category/category.repository';
import { CategoryService } from './category/category.service';
import { ICategoryController } from './category/interface/category.controller.interface';
import { ICategoryRepository } from './category/interface/category.repository.interface';
import { ICategoryService } from './category/interface/category.service.interface';
import { TYPES } from './common/dependency-injection/types';
import { ConfigService } from './config/config.service';
import { IConfigService } from './config/config.service.interface';
import { PrismaService } from './database/prisma.service';
import { ExceptionFilter } from './errors/exception.filter';
import { IExceptionFilter } from './errors/exception.filter.interface';
import { ILogger } from './logger/logger.interface';
import { LoggerService } from './logger/logger.service';
import { IProductController } from './products/interface/products.controller.interface';
import { IProductRepository } from './products/interface/products.repository.interface';
import { IProductService } from './products/interface/products.service.interface';
import { ProductController } from './products/products.controller';
import { ProductRepository } from './products/products.repository';
import { ProductService } from './products/products.service';
import { IUserController } from './users/interface/user.controller.interface';
import { IUserRepository } from './users/interface/user.repository.interface';
import { IUserService } from './users/interface/user.service.interface';
import { UserController } from './users/users.controller';
import { UserRepository } from './users/users.repository';
import { UserService } from './users/users.service';

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	bind<App>(TYPES.Application).to(App);
	bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
	bind<IExceptionFilter>(TYPES.ExceptionFilter).to(ExceptionFilter);
	bind<PrismaService>(TYPES.PrismaService).to(PrismaService);
	bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();
	bind<IUserController>(TYPES.UserController).to(UserController);
	bind<IUserService>(TYPES.UserService).to(UserService);
	bind<IUserRepository>(TYPES.UsersRepository).to(UserRepository);
	bind<IProductService>(TYPES.ProductService).to(ProductService);
	bind<IProductRepository>(TYPES.ProductRepository).to(ProductRepository);
	bind<IProductController>(TYPES.ProductController).to(ProductController);
	bind<ICategoryController>(TYPES.CategoryController).to(CategoryController);
	bind<ICategoryRepository>(TYPES.CategoryRepository).to(CategoryRepository);
	bind<ICategoryService>(TYPES.CategoryService).to(CategoryService);
});

export interface IBootstrapReturn {
	appContainer: Container;
	app: App;
}

async function bootstrap(): Promise<IBootstrapReturn> {
	const appContainer = new Container();
	appContainer.load(appBindings);
	const app = appContainer.get<App>(TYPES.Application);
	await app.init();
	return { app, appContainer };
}

export const boot = bootstrap();
