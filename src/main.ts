import { Container, ContainerModule, interfaces } from 'inversify';
import { App } from './app';
import { IBootstrapReturn } from './bootstrap-return.interface';
import { TYPES } from './common/dependency-injection/types';
import { ConfigService } from './config/config.service';
import { IConfigService } from './config/config.service.interface';
import { PrismaService } from './database/prisma.service';
import { ExceptionFilter } from './errors/exception.filter';
import { IExceptionFilter } from './errors/exception.filter.interface';
import { ILogger } from './logger/logger.interface';
import { LoggerService } from './logger/logger.service';

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	bind<App>(TYPES.Application).to(App);
	bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
	bind<IExceptionFilter>(TYPES.ExceptionFilter).to(ExceptionFilter);
	bind<PrismaService>(TYPES.PrismaService).to(PrismaService);
	bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();
});

async function bootstrap(): Promise<IBootstrapReturn> {
	const appContainer = new Container();
	appContainer.load(appBindings);
	const app = appContainer.get<App>(TYPES.Application);
	return { app, appContainer };
}

export const boot = bootstrap();
