import { inject, injectable } from 'inversify';
import { Markup, Scenes } from 'telegraf';
import { ICategoryRepository } from '../../../category/interface/category.repository.interface';
import { TYPES } from '../../../common/dependency-injection/types';
import { ILogger } from '../../../logger/logger.interface';
import { IProductRepository } from '../../../products/interface/products.repository.interface';
import { Product } from '../../../products/product.entity';
import { IScene } from '../../interface/scene.interface';
import { BACK_TO_START_ACTION, BACK_TO_START_MSG, START_NAME } from '../start/start.scene.enum';
import { IBotContext } from './../../interface/bot-context.interface';
import {
	ADD_TO_CART,
	ADD_TO_CART_ACTION,
	ADD_TO_CART_SUCCESS,
	CATEGORIES_LIST_MESSAGE,
	CATEGORY_NOT_FOUND,
	MENU_ITEM_ACTIONS_LIST,
	MENU_LIST_NAME,
	PRODUCT_NOT_FOUND,
	PRODUCT_OUT_OF_WAREHOUSE,
	SHOW_ALL_PRODUCTS,
	SHOW_ALL_PRODUCTS_ACTION,
	SHOW_MORE,
	SHOW_MORE_ACTION,
	SHOW_PRODUCT_DETAIL,
	SHOW_PRODUCT_DETAIL_ACTION,
	SHOW_PRODUCTS_BY_CATEGORY_ACTION,
} from './menu-list.dictionary';
import { ProductView } from './menu-product-view';

@injectable()
export class MenuListScene implements IScene {
	#commandName = MENU_LIST_NAME;

	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.ProductRepository) private productRepository: IProductRepository,
		@inject(TYPES.CategoryRepository) private categoryRepository: ICategoryRepository,
	) {}

	describeScene(): Scenes.BaseScene<IBotContext> {
		const menuListScene = new Scenes.BaseScene<IBotContext>(this.#commandName);
		menuListScene.enter(async (ctx) => {
			try {
				if (!ctx.session.prodsPage || ctx.session.prodsPage < 0) {
					ctx.session.prodsPage = 1;
				}
				const categories = await this.categoryRepository.getAllCategories();
				const categoryButtons = categories.map((category) =>
					Markup.button.callback(category.name, `${category.id}`),
				);
				const showAllButtons = Markup.button.callback(SHOW_ALL_PRODUCTS, SHOW_ALL_PRODUCTS_ACTION);
				const keyBoard = [...categoryButtons, showAllButtons];
				const inlineKeyBoard = keyBoard.map((btn) => [btn]);
				await ctx.replyWithMarkdownV2(
					CATEGORIES_LIST_MESSAGE,
					Markup.inlineKeyboard(inlineKeyBoard),
				);
				keyBoard.forEach((btn) => {
					menuListScene.action(btn.callback_data, async (ctx) => {
						const categoryId = parseInt(
							btn.callback_data.replace(SHOW_PRODUCTS_BY_CATEGORY_ACTION, ''),
						);
						await this.showProductByCategory(categoryId, ctx);
					});
				});
				menuListScene.action(/show_products_by_category_(\d+)/, async (ctx) => {
					const categoryId = Number(ctx.match[1]);
					const category = await this.categoryRepository.getById(categoryId);
					if (!category) {
						throw new Error(CATEGORY_NOT_FOUND);
					}
					const products = await this.productRepository.find({ categoryId, page: 1 });
					await this.showMenuList(products, ctx);
					ctx.session.prodsPage = 1;
				});
				menuListScene.action(SHOW_ALL_PRODUCTS_ACTION, async (ctx) => {
					const products = await this.productRepository.find({ page: 1 });
					await this.showMenuList(products, ctx);
					ctx.session.prodsPage = 1;
				});
				menuListScene.action(SHOW_MORE_ACTION, async (ctx) => {
					const page = this.getPage(ctx.session.prodsPage);
					const nextPage = page + 1;
					const products = await this.getProducts(nextPage);
					await this.showMenuList(products, ctx);
					ctx.session.prodsPage = nextPage;
				});
				menuListScene.action(BACK_TO_START_ACTION, async (ctx) => {
					ctx.session.prodsPage = 1;
					await ctx.scene.leave();
					await ctx.scene.enter(START_NAME);
				});
				menuListScene.action(/add_to_cart_(\d+)/, async (ctx) => {
					if (!ctx.session.cart) {
						const deliveryAddress = ctx.session.deliveryAddress ? ctx.session.deliveryAddress : {};
						ctx.session.cart = {
							items: [],
							deliveryAddress,
						};
					}
					const productId = Number(ctx.match[1]);
					const product = await this.productRepository.getById(productId);
					if (!product) {
						throw new Error(PRODUCT_NOT_FOUND);
					}
					if (product.quantity <= 0) {
						throw new Error(PRODUCT_OUT_OF_WAREHOUSE);
					}
					const cartItem = ctx.session.cart.items.find((cartItem, index, items) => {
						const isFound = cartItem.productId === productId;
						if (isFound) {
							cartItem.quantity += 1;
							items[index] = cartItem;
						}
						return isFound;
					});
					if (!cartItem) {
						ctx.session.cart.items.push({
							productId,
							quantity: 1,
						});
					}
					await ctx.reply(ADD_TO_CART_SUCCESS);
				});
				menuListScene.action(/show_product_detail_(\d+)/, async (ctx) => {
					const productId = ctx.match[1];
					const product = await this.productRepository.getById(Number(productId));
					if (!product) {
						throw new Error(PRODUCT_NOT_FOUND);
					}
					await this.showProductDetail(product, ctx);
				});
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(e.message);
					await ctx.replyWithMarkdownV2(e.message);
					menuListScene.leave(async (ctx) => {
						ctx.session.prodsPage = 1;
						await ctx.scene.enter(START_NAME);
					});
				}
			}
		});
		return menuListScene;
	}
	commandName(): string {
		return this.#commandName;
	}

	private async getProducts(page: number): Promise<Product[]> {
		return this.productRepository.find({ page });
	}
	private getPage(page?: number): number {
		return !page || page < 0 ? 1 : page;
	}

	private async showMenuListKeyBoard(ctx: IBotContext, isLastPage: boolean): Promise<void> {
		const keyBoard = [];
		if (!isLastPage) {
			keyBoard.push(Markup.button.callback(SHOW_MORE, SHOW_MORE_ACTION));
		}
		keyBoard.push(Markup.button.callback(BACK_TO_START_MSG, BACK_TO_START_ACTION));
		await ctx.replyWithMarkdownV2(MENU_ITEM_ACTIONS_LIST, Markup.inlineKeyboard(keyBoard));
	}

	private async showProductDetail(product: Product, ctx: IBotContext): Promise<void> {
		const productDetail = ProductView.getDetailView(product);
		const keyBoard = [Markup.button.callback(ADD_TO_CART, ADD_TO_CART_ACTION + product.id)];
		await ctx.replyWithMarkdownV2(
			productDetail,
			product.quantity > 0 ? Markup.inlineKeyboard(keyBoard) : undefined,
		);
	}

	private async showMenuList(products: Product[], ctx: IBotContext): Promise<void> {
		for (const product of products) {
			const menuListItem = ProductView.getListView(product);

			const menuItemButtons = [
				Markup.button.callback(SHOW_PRODUCT_DETAIL, SHOW_PRODUCT_DETAIL_ACTION + product.id),
			];
			if (product.quantity > 0) {
				menuItemButtons.push(Markup.button.callback(ADD_TO_CART, ADD_TO_CART_ACTION + product.id));
			}
			await ctx.replyWithMarkdownV2(menuListItem, Markup.inlineKeyboard(menuItemButtons));
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
		await this.showMenuListKeyBoard(ctx, products.length < 10);
	}

	private async showProductByCategory(categoryId: number, ctx: IBotContext): Promise<void> {
		const products = await this.productRepository.find({ categoryId });
		await this.showMenuList(products, ctx);
	}
}
