export enum CartMsg {
	EMPTY = 'Корзина пуста',
	CHECKOUT = 'Оформить заказ',
	CLEAR = 'Очистить корзину',
	ACTION = 'Выберите действие:',
	CLEAR_SUCCESS = 'Корзина очищена',
}

export enum CartErrorMsg {
	DISPLAY_ERROR = 'Ошибка отображения корзины. Пожалуйста, попробуйте позже.',
	DECREASE_ERROR = 'Не удалось уменьшить количество товара',
	INCREASE_ERROR = 'Не удалось увеличить количество товара',
	CLEAR_ERROR = 'Не удалось очистить корзину',
	CHECKOUT_ERROR = 'Не удалось оформить заказ. Пожалуйста, попробуйте позже.',
}
