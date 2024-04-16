import { inject, injectable } from 'inversify';
import { Markup, Scenes } from 'telegraf';
import { BaseScene } from 'telegraf/typings/scenes';
import { TYPES } from '../../../common/dependency-injection/types';
import { ILogger } from '../../../logger/logger.interface';
import { IProductRepository } from '../../../products/interface/products.repository.interface';
import { Product } from '../../../products/product.entity';
import { IBotContext } from '../../interface/bot-context.interface';
import { IScene } from '../../interface/scene.interface';
import { CartItemType } from '../../types/cart-item.type';
import { DELIVERY_NAME } from '../delivery/delivery.dictionary';
import { EmptyDeliveryAddressError } from '../delivery/empty-deliveryAdress.error';
import { MENU_ITEM_ACTIONS_LIST } from '../menu/menu-list.dictionary';
import { ProductView } from '../menu/menu-product-view';
import { BACK_TO_START_ACTION, BACK_TO_START_MSG, START_NAME } from '../start/start.scene.enum';
import {
	ADD_QUANTITY_ACTION,
	ADD_QUANTITY_TEXT,
	CART_EMPTY_MSG,
	CART_NAME,
	CART_START_MSG,
	CHECKOUT_ACTION,
	CHECKOUT_SUCCESS,
	CHECKOUT_TEXT,
	CLEAR_CART_ACTION,
	CLEAR_CART_TEXT,
	PRODUCT_NOT_FOUND_ERR,
	REMOVE_FROM_CART_ACTION,
	REMOVE_FROM_CART_SUCCESS,
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
				if (ctx.session.cart.items.length > 0) {
					await this.showCartProducts(ctx.session.cart.items, ctx);
				} else {
					await this.showEmptyCart(ctx);
				}
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

				if (product && product?.quantity && product.quantity > cartItem.quantity) {
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
					if (isFound && cartItem.quantity > 1) {
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
			cartScene.action(CLEAR_CART_ACTION, async (ctx) => {
				ctx.session.cart.items = [];
				await ctx.replyWithMarkdownV2(CART_EMPTY_MSG);
				await ctx.scene.enter(START_NAME);
			});
			cartScene.action(CHECKOUT_ACTION, async (ctx) => {
				for (const cartItem of ctx.session.cart.items) {
					const product = await this.productRepository.getById(cartItem.productId);
					if (product) {
						await this.productRepository.editQuantity(
							product.id,
							product.quantity - cartItem.quantity,
						);
					}
				}
				ctx.session.cart.items = [];
				await ctx.replyWithMarkdownV2(CHECKOUT_SUCCESS);
				await ctx.scene.enter(START_NAME);
			});
			cartScene.action(/remove_from_cart_(\d+)/, async (ctx) => {
				const productId = Number(ctx.match[1]);
				if (!ctx.session.cart.items) {
					throw new Error(CART_EMPTY_MSG);
				}
				const index = ctx.session.cart.items.findIndex(
					(cartItem) => cartItem.productId === productId,
				);
				if (index >= 0) {
					ctx.session.cart.items.splice(index, 1);
					const items = ctx.session.cart.items;
					await ctx.replyWithMarkdownV2(REMOVE_FROM_CART_SUCCESS);
					if (!items.length) {
						await ctx.replyWithMarkdownV2(CART_EMPTY_MSG);
						await ctx.scene.enter(START_NAME);
					} else {
						await this.showCartProducts(items, ctx);
					}
				} else {
					throw new Error(PRODUCT_NOT_FOUND_ERR);
				}
			});
			cartScene.action(BACK_TO_START_ACTION, async (ctx) => {
				ctx.session.cart.items = [];
				await ctx.scene.enter(START_NAME);
			});
		} catch (e) {
			cartScene.leave();
			if (e instanceof EmptyDeliveryAddressError) {
				cartScene.enter(async (ctx) => {
					await ctx.scene.enter(DELIVERY_NAME);
				});
			}
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
				[
					Markup.button.callback(REMOVE_QUANTITY_TEXT, REMOVE_QUANTITY_ACTION + productId),
					Markup.button.callback(ADD_QUANTITY_TEXT, ADD_QUANTITY_ACTION + product.id),
				],
				[Markup.button.callback(REMOVE_FROM_CART_TEXT, REMOVE_FROM_CART_ACTION + productId)],
			];
			await ctx.replyWithMarkdownV2(productListItem, Markup.inlineKeyboard(productItemsButtons));
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
		await this.showCartActions(ctx);
	}

	private async showCartActions(ctx: IBotContext): Promise<void> {
		const keyBoard = [
			[Markup.button.callback(CHECKOUT_TEXT, CHECKOUT_ACTION)],
			[Markup.button.callback(CLEAR_CART_TEXT, CLEAR_CART_ACTION)],
			[Markup.button.callback(BACK_TO_START_MSG, BACK_TO_START_ACTION)],
		];
		await ctx.replyWithMarkdownV2(MENU_ITEM_ACTIONS_LIST, Markup.inlineKeyboard(keyBoard));
	}

	private async showEmptyCart(ctx: IBotContext): Promise<void> {
		await ctx.replyWithMarkdownV2(CART_EMPTY_MSG);
		await ctx.scene.enter(START_NAME);
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
			[
				Markup.button.callback(REMOVE_QUANTITY_TEXT, REMOVE_QUANTITY_ACTION + productId),
				Markup.button.callback(ADD_QUANTITY_TEXT, ADD_QUANTITY_ACTION + productId),
			],
			[Markup.button.callback(REMOVE_FROM_CART_TEXT, REMOVE_FROM_CART_ACTION + productId)],
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
