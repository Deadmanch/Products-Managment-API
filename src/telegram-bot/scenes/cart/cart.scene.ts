import { inject, injectable } from 'inversify';
import { Markup, Scenes } from 'telegraf';
import { BaseScene } from 'telegraf/typings/scenes';
import { TYPES } from '../../../common/dependency-injection/types';
import { ILogger } from '../../../logger/logger.interface';
import { IProductRepository } from '../../../products/interface/products.repository.interface';
import { Product } from '../../../products/product.entity';
import { EmptyDeliveryAddressError } from '../../errors/deliverty-error/empty-deliveryAdress.error';
import { IBotContext } from '../../interface/bot-context.interface';
import { IScene } from '../../interface/scene.interface';
import { CartItemType } from '../../types/cart-item.type';
import { DeliveryView } from '../delivery/delivery.view';
import { SHOW_PRODUCT_DETAIL, SHOW_PRODUCT_DETAIL_ACTION } from '../menu/menu-list.dictionary';
import { ProductView } from '../menu/menu-product-view';
import {
	ADD_QUANTITY_ACTION,
	ADD_QUANTITY_TEXT,
	CART_EMPTY_MSG,
	CART_NAME,
	CART_START_MSG,
	PRODUCT_NOT_FOUND_ERR,
	REMOVE_FROM_CART_ACTION,
	REMOVE_FROM_CART_TEXT,
	REMOVE_QUANTITY_ACTION,
	REMOVE_QUANTITY_TEXT,
} from './cart.dictionary';

@injectable()
export class CartScene implements IScene {
	#commandName = CART_NAME;
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.ProductRepository) private productRepository: IProductRepository,
	) {}

	describeScene(): BaseScene<IBotContext> {
		const cartScene = new Scenes.BaseScene<IBotContext>(this.#commandName);
		try {
			cartScene.enter(async (ctx) => {
				this.defineCart(ctx);
				if (!ctx.session.deliveryAddress) {
					throw new EmptyDeliveryAddressError();
				}
				await ctx.replyWithMarkdownV2(CART_START_MSG);
				await ctx.replyWithMarkdownV2(DeliveryView.getDeliveryAddress(ctx.session.deliveryAddress));

				await (ctx.session.cart.items
					? this.showCartProducts(ctx.session.cart.items, ctx)
					: this.showEmptyCart(ctx));
			});

			cartScene.action(/add_quantity_(\d+)/, async (ctx) => {
				const productId = Number(ctx.match[1]);
				if (!ctx.session.cart.items) {
					throw new Error(CART_EMPTY_MSG);
				}
				const product = await this.productRepository.getById(productId);
				const cartItem = ctx.session.cart.items.find((cartItem, index, items) => {
					const isFound = cartItem.productId === productId;
					if (isFound && product && product?.quantity && product.quantity > cartItem.quantity) {
						cartItem.quantity += 1;
						items[index] = cartItem;
					}
					return isFound;
				});
				if (!cartItem) {
					throw new Error(PRODUCT_NOT_FOUND_ERR);
				}
				if (product && product?.quantity && product.quantity >= cartItem.quantity) {
					await this.editCartItemView(ctx, productId, product, cartItem);
				}
			});

			cartScene.action(/remove_quantity_(\d+)/, async (ctx) => {
				const productId = Number(ctx.match[1]);
				if (!ctx.session.cart.items) {
					throw new Error(CART_EMPTY_MSG);
				}
				const product = await this.productRepository.getById(productId);
				const cartItem = ctx.session.cart.items.find((cartItem, index, items) => {
					const isFound = cartItem.productId === productId;
					if (isFound && cartItem.quantity > 0) {
						cartItem.quantity -= 1;
						items[index] = cartItem;
					}
					return isFound;
				});
				if (!cartItem) {
					throw new Error(PRODUCT_NOT_FOUND_ERR);
				}
				if (product && product?.quantity && product.quantity >= cartItem.quantity) {
					await this.editCartItemView(ctx, productId, product, cartItem);
				}
			});
		} catch (e) {
			cartScene.leave();
			if (e instanceof Error) {
				this.loggerService.error(e.message);
				cartScene.enter(async (ctx) => {
					await ctx.replyWithMarkdownV2(e.message);
				});
			}
		}
		return cartScene;
	}

	commandName(): string {
		return this.#commandName;
	}

	private async showCartProducts(cartItems: CartItemType[], ctx: IBotContext): Promise<void> {
		const productId = cartItems.map((cartItem) => cartItem.productId);
		const products = await this.productRepository.getProductListByIds(productId);
		if (!products) {
			await this.showEmptyCart(ctx);
			return;
		}
		for (const product of products) {
			const cartItem = cartItems.find((cartItem) => cartItem.productId === product.id);
			if (!cartItem?.quantity) {
				continue;
			}
			const productListItem = ProductView.getCartListView(
				product.title,
				cartItem.quantity,
				cartItem.quantity * Number(product.price),
			);

			const productItemsButtons = [
				Markup.button.callback(ADD_QUANTITY_TEXT, ADD_QUANTITY_ACTION + product.id),
				Markup.button.callback(REMOVE_QUANTITY_TEXT, REMOVE_QUANTITY_ACTION + productId),
				Markup.button.callback(REMOVE_FROM_CART_TEXT, REMOVE_FROM_CART_ACTION + productId),
				Markup.button.callback(SHOW_PRODUCT_DETAIL, SHOW_PRODUCT_DETAIL_ACTION + productId),
			];
			await ctx.replyWithMarkdownV2(productListItem, Markup.inlineKeyboard(productItemsButtons));
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	}

	private async showEmptyCart(ctx: IBotContext): Promise<void> {
		await ctx.reply(CART_EMPTY_MSG);
	}

	private async defineCart(ctx: IBotContext): Promise<void> {
		if (!ctx.session.cart) {
			const deliveryAddress = ctx.session.deliveryAddress ? ctx.session.deliveryAddress : {};
			ctx.session.cart = {
				items: [],
				deliveryAddress,
			};
		}
	}

	private async editCartItemView(
		ctx: IBotContext,
		productId: number,
		product: Product,
		cartItem: CartItemType,
	): Promise<void> {
		const keyBoard = [
			Markup.button.callback(ADD_QUANTITY_TEXT, ADD_QUANTITY_ACTION + productId),
			Markup.button.callback(REMOVE_QUANTITY_TEXT, REMOVE_QUANTITY_ACTION + productId),
			Markup.button.callback(REMOVE_FROM_CART_TEXT, REMOVE_FROM_CART_ACTION + productId),
			Markup.button.callback(SHOW_PRODUCT_DETAIL, SHOW_PRODUCT_DETAIL_ACTION + productId),
		];
		await ctx.editMessageText(
			ProductView.getCartListView(
				product.title,
				cartItem.quantity,
				cartItem.quantity * Number(product.price),
			),
			{
				parse_mode: 'MarkdownV2',
				...Markup.inlineKeyboard(keyBoard),
			},
		);
	}
}
