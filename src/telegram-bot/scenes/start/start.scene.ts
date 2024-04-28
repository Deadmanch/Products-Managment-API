import { inject, injectable } from 'inversify';
import { Markup, Scenes } from 'telegraf';
import { TYPES } from '../../../common/dependency-injection/types';
import { ILogger } from '../../../logger/logger.interface';
import { IBotContext } from '../../interface/bot-context.interface';
import { IScene } from '../../interface/scene.interface';
import {
	DELIVERY_NAME,
	SET_ADDRESS_ACTION,
	SET_DELIVERY_MSG,
} from '../delivery/delivery.dictionary';
import { DeliveryView } from '../delivery/delivery.view';
import { ScenesEnum } from '../enums/scenes.enums';
import { DELIVERY_NOT_EXIST, START_MSG } from './start.scene.enum';

@injectable()
export class StartScene implements IScene {
	#commandName = ScenesEnum.START;
	constructor(@inject(TYPES.ILogger) private readonly loggerService: ILogger) {}
	describeScene(): Scenes.BaseScene<IBotContext> {
		const startScene = new Scenes.BaseScene<IBotContext>(this.#commandName);
		const menu = Markup.inlineKeyboard([
			[Markup.button.callback(SET_DELIVERY_MSG, SET_ADDRESS_ACTION)],
			[Markup.button.callback('Меню', 'showMenu')],
			[Markup.button.callback('Корзина', 'showCart')],
		]);
		startScene.enter(async (ctx) => {
			await ctx.replyWithMarkdownV2(START_MSG);
			try {
				if (!ctx.session.deliveryAddress) {
					await ctx.reply(DELIVERY_NOT_EXIST);
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

		startScene.action('showMenu', (ctx) => {
			ctx.scene.enter(ScenesEnum.CATEGORY);
		});

		startScene.action(SET_ADDRESS_ACTION, (ctx) => {
			ctx.scene.enter(ScenesEnum.DELIVERY);
		});

		startScene.action('showCart', (ctx) => {
			ctx.scene.enter(ScenesEnum.CART);
		});

		return startScene;
	}

	commandName(): string {
		return this.#commandName;
	}
}
