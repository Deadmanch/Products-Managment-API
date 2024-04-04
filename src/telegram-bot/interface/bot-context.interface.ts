import { Context, Scenes } from 'telegraf';
import { ISession } from './session.interface';

export interface IBotContext extends Context {
	session: ISession;
	scene: Scenes.SceneContextScene<IBotContext>;
}
