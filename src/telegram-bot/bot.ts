import { inject, injectable } from 'inversify';
import { Scenes, Telegraf } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import { TYPES } from '../common/dependency-injection/types';
import { IConfigService } from '../config/config.service.interface';
import { ILogger } from '../logger/logger.interface';
import { IBotContext } from './interface/bot-context.interface';
import { IScene } from './interface/scene.interface';

@injectable()
export class Bot {
	#telegraf: Telegraf<IBotContext>;

	constructor(
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.StartScene) private startScene: IScene,
	) {
		const token = this.configService.get('TELEGRAM_TOKEN');
		this.#telegraf = new Telegraf<IBotContext>(token);
	}

	private useScenes(scenes: Scenes.BaseScene<IBotContext>[]): void {
		const stage = new Scenes.Stage<IBotContext>(scenes);

		this.#telegraf.use(new LocalSession({ database: 'local-session.json' }).middleware());
		this.#telegraf.use(stage.middleware());
	}

	init(): void {
		this.useScenes([this.startScene.describeScene()]);
		const scenes = [this.startScene];

		for (const scene of scenes) {
			this.#telegraf.command(scene.commandName(), (ctx) => ctx.scene.enter(scene.commandName()));
		}
		this.#telegraf.launch();
		this.loggerService.log(`[TELEGRAM-BOT] 🤖 Телеграм-бот успешно стартовал 🚀`);
	}
}
