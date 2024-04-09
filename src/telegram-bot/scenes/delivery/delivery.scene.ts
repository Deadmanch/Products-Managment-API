import { inject, injectable } from 'inversify';
import { Scenes } from 'telegraf';
import { TYPES } from '../../../common/dependency-injection/types';
import { ILogger } from '../../../logger/logger.interface';
import { DeliveryError } from '../../errors/deliverty-error/delivery-error';
import { NotTextDeliveryError } from '../../errors/deliverty-error/not-text-delivery.error';
import { IBotContext } from '../../interface/bot-context.interface';
import { IScene } from '../../interface/scene.interface';
import { DeliveryAddressType } from '../../types/delivery-address.type';
import { MENU_LIST_NAME } from '../menu/menu-list.dictionary';
import {
	DELIVERY_NAME,
	DeliveryStepEnum,
	INVALID_DELIVERY_STEP_MSG,
	INVALID_MSG_TYPE_ERROR,
	SET_BUILDING_MSG,
	SET_CITY_MSG,
	SET_DELIVERY_FINISHED_MSG,
	SET_NAME_MSG,
	SET_STREET_MSG,
} from './delivery.dictionary';

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
			const deliveryAddress = ctx.session.deliveryAddress as DeliveryAddressType;
			try {
				if (!('text' in ctx.message)) {
					throw new NotTextDeliveryError();
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
						await ctx.scene.enter(MENU_LIST_NAME);
						break;
					default:
						throw new DeliveryError(INVALID_DELIVERY_STEP_MSG);
				}
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(e.message);
				}
				if (e instanceof NotTextDeliveryError) {
					await ctx.reply(INVALID_MSG_TYPE_ERROR);
				}
				if (e instanceof DeliveryError) {
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
