import { inject, injectable } from 'inversify';
import { Markup, Scenes } from 'telegraf';
import { TYPES } from '../../../common/dependency-injection/types';
import { ILogger } from '../../../logger/logger.interface';
import { Product } from '../../../products/product.entity';
import { ProductRepository } from '../../../products/products.repository';
import { IBotContext } from '../../interface/bot-context.interface';
import { IScene } from '../../interface/scene.interface';
import { ScenesEnum } from '../enums/scenes.enums';
import { ProductView } from '../product/product-view';
import { CartErrorMsg, CartMsg } from './cart.dictionary';
import { ICartItem } from './interface/cart-item.interface';

@injectable()
export class CartScene implements IScene {
	#commandName = ScenesEnum.CART;
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.ProductRepository) private productRepository: ProductRepository,
	) {}

	commandName(): string {
		return this.#commandName;
	}

	describeScene(): Scenes.BaseScene<IBotContext> {
		const cartScene = new Scenes.BaseScene<IBotContext>(this.#commandName);
		cartScene.enter(async (ctx) => {
			try {
				const { cart } = ctx.session;
				const cartItems = Object.entries(cart.items);

				if (cartItems.length === 0) {
					await ctx.reply(CartMsg.EMPTY);
					await ctx.scene.enter(ScenesEnum.START);
					return;
				}
				for (const [productId, cartItem] of cartItems) {
					const product = await this.productRepository.getById(Number(productId));

					if (!product) continue;
					const cartListView = ProductView.getCartListView(
						product.title,
						cartItem.quantity,
						Number(product.price) * cartItem.quantity,
					);
					await ctx.replyWithMarkdownV2(
						cartListView,
						Markup.inlineKeyboard([
							Markup.button.callback('-', `decreaseQuantity_${product.id}`),
							Markup.button.callback('+', `increaseQuantity_${product.id}`),
						]),
					);
				}

				await ctx.reply(
					CartMsg.ACTION,
					Markup.inlineKeyboard([
						Markup.button.callback(CartMsg.CHECKOUT, 'checkout'),
						Markup.button.callback(CartMsg.CLEAR, 'clearCart'),
					]),
				);
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(
						`Failed to display cart items [Function: cartScene.enter] - Error: ${e.message}`,
					);
					await ctx.reply(CartErrorMsg.DISPLAY_ERROR);
				}
			}
		});
		cartScene.action(/decreaseQuantity_(\d+)/, async (ctx) => {
			try {
				const productId = Number(ctx.match[1]);
				const { cart } = ctx.session;
				const item = cart.items[productId];

				if (item.quantity > 1) {
					item.quantity--;
					ctx.session.cart.items[productId].quantity = item.quantity;
					const product = await this.productRepository.getById(productId);
					if (!product) return;

					await this.editCartItemView(ctx, productId, product, item);
				}
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(
						`Failed to decrease quantity [Function: cartScene.action] - Error: ${e.message}`,
					);
					await ctx.reply(CartErrorMsg.DECREASE_ERROR);
				}
			}
		});
		cartScene.action(/increaseQuantity_(\d+)/, async (ctx) => {
			try {
				const productId = Number(ctx.match[1]);
				const { cart } = ctx.session;
				const item = cart.items[productId];
				const product = await this.productRepository.getById(productId);
				if (product && item.quantity < product.quantity) {
					item.quantity++;
					ctx.session.cart.items[productId].quantity = item.quantity;
					const product = await this.productRepository.getById(productId);
					if (!product) return;

					await this.editCartItemView(ctx, productId, product, item);
				}
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(
						`Error increasing quantity [Action: increaseQuantity] - Error: ${e.message}`,
					);
					await ctx.reply(CartErrorMsg.INCREASE_ERROR);
				}
			}
		});
		cartScene.action('clearCart', async (ctx) => {
			try {
				ctx.session.cart = { items: {}, deliveryAddress: ctx.session.deliveryAddress };
				await ctx.reply(CartMsg.CLEAR_SUCCESS);
				await ctx.scene.enter(ScenesEnum.START);
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(`Error clearing cart [Action: clearCart] - Error: ${e.message}`);
					await ctx.reply(CartErrorMsg.CLEAR_ERROR);
				}
			}
		});
		cartScene.action('checkout', async (ctx) => {
			try {
				const { cart } = ctx.session;
				const cartItems = Object.entries(cart.items);
				let totalPrice = 0;
				const purchasedItems = [];

				for (const [productId, cartItem] of cartItems) {
					const product = await this.productRepository.getById(Number(productId));
					if (!product) continue;
					if (cartItem.quantity > product.quantity) {
						await ctx.reply(
							`Доступного количества товара "${product.title}" не хватает. Остаток на складе: ${product.quantity}`,
						);
						return;
					} else {
						totalPrice += Number(product.price) * cartItem.quantity;
						purchasedItems.push(`${cartItem.quantity}x ${product.title}`);
						await this.productRepository.editQuantity(
							product.id,
							product.quantity - cartItem.quantity,
						);
					}
				}
				await ctx.reply(
					`Заказ успешно оформлен! 👍\n\nКупленные товары:\n${purchasedItems.join('\n')}\n\nОбщая сумма покупки: ${totalPrice} руб.`,
				);
				ctx.session.cart = { items: {}, deliveryAddress: ctx.session.deliveryAddress };
				await ctx.scene.enter(ScenesEnum.START);
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(
						`Error checking out the cart [Action: checkout] - Error: ${e.message}`,
					);
					await ctx.reply(CartErrorMsg.CHECKOUT_ERROR);
				}
			}
		});
		return cartScene;
	}
	private async editCartItemView(
		ctx: IBotContext,
		productId: number,
		product: Product,
		cartItem: ICartItem,
	): Promise<void> {
		const keyBoard = [
			Markup.button.callback('-', `decreaseQuantity_${productId}`),
			Markup.button.callback('+', `increaseQuantity_${productId}`),
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
