import { inject, injectable } from 'inversify';
import { Markup, Scenes } from 'telegraf';
import { ICategoryRepository } from '../../../category/interface/category.repository.interface';
import { TYPES } from '../../../common/dependency-injection/types';
import { ILogger } from '../../../logger/logger.interface';
import { IBotContext } from '../../interface/bot-context.interface';
import { IScene } from '../../interface/scene.interface';
import { ScenesEnum } from '../enums/scenes.enums';
import {
	CATEGORY_DEFAULT_OFFSET,
	CategoryButtonsMsg,
	CategoryErrorMsg,
} from './category.dictionary';

@injectable()
export class CategoryScene implements IScene {
	#commandName = ScenesEnum.CATEGORY;
	constructor(
		@inject(TYPES.ILogger) private readonly loggerService: ILogger,
		@inject(TYPES.CategoryRepository) private categoryRepository: ICategoryRepository,
	) {}
	describeScene(): Scenes.BaseScene<IBotContext> {
		const categoryScene = new Scenes.BaseScene<IBotContext>(this.#commandName);
		categoryScene.enter(async (ctx) => {
			try {
				const page = ctx.session.currentPage || 1;
				const categories = await this.categoryRepository.getCategories(page);
				ctx.session.currentPage = page;

				const buttons = categories.map((category) =>
					Markup.button.callback(category.name, `selectCategory_${category.id}`),
				);
				if (categories.length === CATEGORY_DEFAULT_OFFSET) {
					buttons.push(
						Markup.button.callback(CategoryButtonsMsg.MORE, `moreCategories_${page + 1}`),
					);
				}
				await ctx.reply(CategoryButtonsMsg.SELECT, Markup.inlineKeyboard(buttons, { columns: 1 }));
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(
						`Failed to fetch categories [Function: categoryScene.enter] - Error: ${e.message}`,
					);
					await ctx.reply(CategoryErrorMsg.ERROR_LOADING);
				}
			}
		});
		categoryScene.action(/moreCategories_(\d+)/, async (ctx) => {
			try {
				const page = Number(ctx.match[1]);
				ctx.session.currentPage = page;
				await ctx.scene.reenter();
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(
						`Error with pagination in categories [Action: moreCategories] - Error: ${e.message}`,
					);
					await ctx.reply(CategoryErrorMsg.ERROR_LOADING_MORE);
				}
			}
		});

		categoryScene.action(/selectCategory_(\d+)/, async (ctx) => {
			try {
				const categoryId = Number(ctx.match[1]);
				ctx.session.currentCategoryId = categoryId;
				ctx.session.currentProductPage = 1;
				ctx.session.currentPage = 1;
				await ctx.scene.enter(ScenesEnum.PRODUCT);
			} catch (e) {
				if (e instanceof Error) {
					this.loggerService.error(
						`Error with selecting category [Action: selectCategory] - Error: ${e.message}`,
					);
					await ctx.reply(CategoryErrorMsg.ERROR_SELECT);
				}
			}
		});
		return categoryScene;
	}
	commandName(): string {
		return this.#commandName;
	}
}
