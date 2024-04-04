import { injectable } from 'inversify';
import { Scenes } from 'telegraf';
import { IScene } from '../../interface/scene.interface';
import { IBotContext } from './../../interface/bot-context.interface';
import { StartSceneEnum } from './start.scene.enum';

@injectable()
export class StartScene implements IScene {
	#commandName = StartSceneEnum.NAME;

	describeScene(): Scenes.BaseScene<IBotContext> {
		const startScene = new Scenes.BaseScene<IBotContext>(this.#commandName);
		startScene.enter((ctx) => ctx.reply(StartSceneEnum.START_MSG));

		return startScene;
	}

	commandName(): string {
		return this.#commandName;
	}
}
