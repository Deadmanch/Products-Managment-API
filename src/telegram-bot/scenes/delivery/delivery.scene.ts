import { inject, injectable } from 'inversify';
import { Scenes } from 'telegraf';
import { TYPES } from '../../../common/dependency-injection/types';
import { ILogger } from '../../../logger/logger.interface';
import { IBotContext } from '../../interface/bot-context.interface';
import { IScene } from '../../interface/scene.interface';
import { ScenesEnum } from '../enums/scenes.enums';
import {
	DELIVERY_NAME,
	DeliveryStepEnum,
	INVALID_DELIVERY_STEP_MSG,
	NOT_TEXT_MSG_ERROR,
	SET_BUILDING_MSG,
	SET_CITY_MSG,
	SET_DELIVERY_FINISHED_MSG,
	SET_NAME_MSG,
	SET_STREET_MSG,
} from './delivery.dictionary';
import { IDeliveryAddress } from './interface/delivery-address.interface';

@injectable()
export class DeliveryScene implements IScene {
	#commandName = DELIVERY_NAME;

	constructor(@inject(TYPES.ILogger) private loggerService: ILogger) {}

	describeScene(): Scenes.BaseScene<IBotContext> {
		const deliveryScene = new Scenes.BaseScene<IBotContext>(this.#commandName);

		deliveryScene.enter(async (ctx) => {
			if (!ctx.session.deliveryAddress) {
				ctx.session.deliveryAddress = {};
			}
			if (!ctx.session.deliveryStep) {
				ctx.session.deliveryStep = DeliveryStepEnum.ENTER_NAME;
				await ctx.reply(SET_NAME_MSG);
			}
		});

		deliveryScene.on('message', async (ctx) => {
			const deliveryAddress = ctx.session.deliveryAddress as IDeliveryAddress;
			try {
				if (!('text' in ctx.message)) {
					throw new Error(NOT_TEXT_MSG_ERROR);
				}
				switch (ctx.session.deliveryStep) {
					case DeliveryStepEnum.ENTER_NAME:
						deliveryAddress.name = ctx.message.text;
						await ctx.reply(SET_CITY_MSG);
						ctx.session.deliveryStep = DeliveryStepEnum.ENTER_CITY;
						break;
					case DeliveryStepEnum.ENTER_CITY:
						deliveryAddress.city = ctx.message.text;
						await ctx.reply(SET_STREET_MSG);
						ctx.session.deliveryStep = DeliveryStepEnum.ENTER_STREET;
						break;
					case DeliveryStepEnum.ENTER_STREET:
						deliveryAddress.street = ctx.message.text;
						await ctx.reply(SET_BUILDING_MSG);
						ctx.session.deliveryStep = DeliveryStepEnum.ENTER_BUILDING;
						break;
					case DeliveryStepEnum.ENTER_BUILDING:
						deliveryAddress.building = ctx.message.text;
						await ctx.reply(SET_DELIVERY_FINISHED_MSG);
						ctx.session.deliveryStep = null;
						await ctx.scene.leave();
						await ctx.scene.enter(ScenesEnum.CATEGORY);
						break;
					default:
						throw new Error(INVALID_DELIVERY_STEP_MSG);
				}
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(e.message);
					await ctx.reply(e.message);
				}
				await ctx.scene.leave();
			}
		});
		return deliveryScene;
	}
	commandName(): string {
		return this.#commandName;
	}
}
