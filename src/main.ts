import { Container, ContainerModule, interfaces } from 'inversify';
import { App } from './app';
import { IBootstrapReturn } from './bootstrap-return.interface';
import { TYPES } from './common/dependency-injection/types';
import { ILogger } from './logger/logger.interface';
import { LoggerService } from './logger/logger.service';

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	bind<App>(TYPES.Application).to(App);
	bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
});

async function bootstrap(): Promise<IBootstrapReturn> {
	const appContainer = new Container();
	appContainer.load(appBindings);
	const app = appContainer.get<App>(TYPES.Application);
	return { app, appContainer };
}

export const boot = bootstrap();
