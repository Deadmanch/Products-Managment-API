import { inject, injectable } from 'inversify';
import { Markup, Scenes } from 'telegraf';
import { TYPES } from '../../../common/dependency-injection/types';
import { ILogger } from '../../../logger/logger.interface';
import { IBotContext } from '../../interface/bot-context.interface';
import { IScene } from '../../interface/scene.interface';
import { CART_NAME, CART_NAME_MSG, SHOW_CART_ACTION } from '../cart/cart.dictionary';
import {
	DELIVERY_NAME,
	SET_ADDRESS_ACTION,
	SET_DELIVERY_MSG,
} from '../delivery/delivery.dictionary';
import { DeliveryView } from '../delivery/delivery.view';
import { MENU_LIST_NAME, SHOW_MENU_ACTION, SHOW_MENU_MSG } from '../menu/menu-list.dictionary';
import { DELIVERY_NOT_EXIST, START_MSG, START_NAME } from './start.scene.enum';

@injectable()
export class StartScene implements IScene {
	#commandName = START_NAME;
	constructor(@inject(TYPES.ILogger) private readonly loggerService: ILogger) {}
	describeScene(): Scenes.BaseScene<IBotContext> {
		const startScene = new Scenes.BaseScene<IBotContext>(this.#commandName);
		const menu = Markup.inlineKeyboard([
			Markup.button.callback(SET_DELIVERY_MSG, SET_ADDRESS_ACTION),
			Markup.button.callback(SHOW_MENU_MSG, SHOW_MENU_ACTION),
			Markup.button.callback(CART_NAME_MSG, SHOW_CART_ACTION),
		]);
		startScene.enter(async (ctx) => {
			await ctx.replyWithMarkdownV2(START_MSG);
			try {
				if (!ctx.session.deliveryAddress) {
					await ctx.reply(DELIVERY_NOT_EXIST);
					await ctx.scene.leave();
					await ctx.scene.enter(DELIVERY_NAME);
				} else {
					await ctx.replyWithMarkdownV2(
						DeliveryView.getDeliveryAddress(ctx.session.deliveryAddress),
					);
					await ctx.reply('Выберите одну из команд:', menu);
				}
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(e.message);
				}
				await ctx.scene.leave();
			}
		});

		startScene.action(SHOW_MENU_ACTION, (ctx) => {
			ctx.scene.leave();
			ctx.scene.enter(MENU_LIST_NAME);
		});

		startScene.action(SET_ADDRESS_ACTION, (ctx) => {
			ctx.scene.leave();
			ctx.scene.enter(DELIVERY_NAME);
		});

		startScene.action(SHOW_CART_ACTION, (ctx) => {
			ctx.scene.leave();
			ctx.scene.enter(CART_NAME);
		});

		return startScene;
	}

	commandName(): string {
		return this.#commandName;
	}
}
