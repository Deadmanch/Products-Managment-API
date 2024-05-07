import { inject, injectable } from 'inversify';
import { Markup, Scenes } from 'telegraf';
import { TYPES } from '../../../common/dependency-injection/types';
import { ILogger } from '../../../logger/logger.interface';
import { IProductRepository } from '../../../products/interface/products.repository.interface';
import { IBotContext } from '../../interface/bot-context.interface';
import { IScene } from '../../interface/scene.interface';
import { ScenesEnum } from '../enums/scenes.enums';
import { ProductView } from './product-view';
import { PRODUCT_DEFAULT_OFFSET, ProductButtonsMsg, ProductErrorMsg } from './product.dictionary';

@injectable()
export class ProductScene implements IScene {
	#commandName = ScenesEnum.PRODUCT;
	constructor(
		@inject(TYPES.ILogger) private readonly loggerService: ILogger,
		@inject(TYPES.ProductRepository) private readonly productRepository: IProductRepository,
	) {}

	describeScene(): Scenes.BaseScene<IBotContext> {
		const productScene = new Scenes.BaseScene<IBotContext>(this.#commandName);

		productScene.enter(async (ctx) => {
			try {
				const { currentCategoryId, currentProductPage = 1 } = ctx.session;

				const products = await this.productRepository.find({
					categoryId: currentCategoryId,
					page: currentProductPage,
				});
				for (const product of products) {
					const productView = ProductView.getListView(product);
					const productButton = [
						Markup.button.callback(ProductButtonsMsg.DETAIL, `productDetail_${product.id}`),
					];
					if (product.quantity > 0) {
						productButton.push(
							Markup.button.callback(ProductButtonsMsg.ADD_TO_CART, `addToCart_${product.id}`),
						);
					}
					await ctx.replyWithMarkdownV2(productView, Markup.inlineKeyboard(productButton));
				}
				if (products.length === PRODUCT_DEFAULT_OFFSET) {
					const moreButton = Markup.button.callback(
						ProductButtonsMsg.MORE,
						`moreProducts_${currentProductPage + 1}`,
					);
					await ctx.reply(ProductButtonsMsg.OTHER, {
						reply_markup: Markup.inlineKeyboard([moreButton]).reply_markup,
					});
				}
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(
						`Failed to fetch products [Function: productScene.enter] - Error: ${e.message}`,
					);
					await ctx.reply(ProductErrorMsg.ERROR_LOADING);
				}
			}
		});
		productScene.action(/moreProducts_(\d+)/, async (ctx) => {
			try {
				const page = Number(ctx.match[1]);
				ctx.session.currentProductPage = page;
				await ctx.scene.reenter();
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(
						`Error with pagination in products [Action: moreProducts] - Error: ${e.message}`,
					);
					await ctx.reply(ProductErrorMsg.ERROR_LOADING_MORE);
				}
			}
		});
		productScene.action(/productDetail_(\d+)/, async (ctx) => {
			try {
				const productId = Number(ctx.match[1]);
				const product = await this.productRepository.getById(productId);
				if (!product) {
					await ctx.reply(ProductErrorMsg.NOT_FOUND);
					return;
				}
				const buttons = [
					Markup.button.callback(ProductButtonsMsg.BACK_TO_PRODUCTS, 'backToProducts'),
				];
				if (product.quantity > 0) {
					buttons.push(
						Markup.button.callback(ProductButtonsMsg.ADD_TO_CART, `addToCart_${product.id}`),
					);
				}
				await ctx.replyWithMarkdownV2(
					ProductView.getDetailView(product),
					Markup.inlineKeyboard(buttons),
				);
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(
						`Error with selecting product [Action: productDetail] - Error: ${e.message}`,
					);
					await ctx.reply(ProductErrorMsg.ERROR_DETAIL);
				}
			}
		});
		productScene.action('backToProducts', async (ctx) => ctx.scene.reenter());
		productScene.action(/addToCart_(\d+)/, async (ctx) => {
			try {
				const productId = Number(ctx.match[1]);
				const product = await this.productRepository.getById(productId);
				const cart = ctx.session.cart || { items: {} };
				if (product && product.quantity > 0) {
					if (cart.items[productId] && cart.items[productId].quantity < product.quantity) {
						cart.items[productId].quantity++;
					} else if (!cart.items[productId]) {
						cart.items[productId] = { quantity: 1 };
					} else {
						await ctx.reply(ProductErrorMsg.PRODUCT_OUT);
						return;
					}
					ctx.session.cart = cart;
					await ctx.editMessageText(ProductButtonsMsg.ADD_TO_CART_SUCCESS);
				}
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(
						`Error with adding product to cart [Action: addToCart] - Error: ${e.message}`,
					);
					await ctx.editMessageText(ProductErrorMsg.ADD_TO_CART_ERROR);
				}
			}
		});
		return productScene;
	}

	commandName(): string {
		return this.#commandName;
	}
}
