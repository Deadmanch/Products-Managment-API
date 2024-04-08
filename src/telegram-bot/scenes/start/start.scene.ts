import { injectable } from 'inversify';
import { Scenes } from 'telegraf';
import { IScene } from '../../interface/scene.interface';
import { IBotContext } from './../../interface/bot-context.interface';
import { START_MSG, START_NAME } from './start.scene.enum';

@injectable()
export class StartScene implements IScene {
	#commandName = START_NAME;

	describeScene(): Scenes.BaseScene<IBotContext> {
		const startScene = new Scenes.BaseScene<IBotContext>(this.#commandName);
		startScene.enter((ctx) => ctx.reply(START_MSG));

		return startScene;
	}

	commandName(): string {
		return this.#commandName;
	}
}
