export const PRODUCT_DEFAULT_OFFSET = 10;

export enum ProductButtonsMsg {
	DETAIL = 'Подробнее',
	ADD_TO_CART = 'В корзину',
	MORE = 'Показать больше',
	OTHER = 'Другие товары:',
	BACK_TO_PRODUCTS = 'Назад к списку товаров',
	ADD_TO_CART_SUCCESS = 'Товар добавлен в корзину',
}

export enum ProductErrorMsg {
	ERROR_LOADING = 'Ошибка при загрузке товаров. Пожалуйста, попробуйте позже.',
	ERROR_LOADING_MORE = 'Не удалось загрузить больше товаров. Попробуйте позже.',
	NOT_FOUND = 'Товар не найден.',
	ERROR_DETAIL = 'Ошибка при загрузке информации о продукте.',
	PRODUCT_OUT = 'Извините, этот товар уже закончился',
	ADD_TO_CART_ERROR = 'Не удалось добавить продукт в корзину.',
}
