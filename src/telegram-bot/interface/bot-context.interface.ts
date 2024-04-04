import { Context, Scenes } from 'telegraf';

export interface IBotContext extends Context {
	myProp: string;
	session;
	scene: Scenes.SceneContextScene<IBotContext>;
}
