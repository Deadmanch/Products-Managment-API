import { injectable } from 'inversify';
import { Telegraf } from 'telegraf';
import { TYPES } from '../common/dependency-injection/types';
import { IConfigService } from '../config/config.service.interface';
import { ILogger } from '../logger/logger.interface';
import { IBotContext } from './interface/bot-context.interface';

@injectable()
export class Bot {
	#telegraf: Telegraf<IBotContext>;

	constructor(
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.ILogger) private loggerService: ILogger,
	) {}
}
