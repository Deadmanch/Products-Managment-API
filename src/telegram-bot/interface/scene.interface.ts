import { Scenes } from 'telegraf';
import { IBotContext } from './bot-context.interface';

export interface IScene {
	commandName: () => string;
	describeScene: () => Scenes.BaseScene<IBotContext>;
}
