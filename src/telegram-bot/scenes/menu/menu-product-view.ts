import { Product } from '../../../products/product.entity';

export class ProductView {
	static getListView(product: Product): string {
		return `*\nНаименование: ${product.title}*
Цена\\: ${this.escapeMarkDown(product.price.toFixed(2))} руб\\.
${product.quantity > 0 ? 'В наличии\\: ' + this.escapeMarkDown(String(product.quantity)) + ' шт\\.' : 'Нет в наличии'}`;
	}

	static getCartListView(productName: string, quantity: number, totalPrice: number): string {
		return `*\nНаименование: ${productName}*
Количество\\: ${this.escapeMarkDown(String(quantity))} шт\\.
Цена\\: ${this.escapeMarkDown(totalPrice.toFixed(2))} руб\\.`;
	}

	static getDetailView(product: Product): string {
		return `*\nНаименование: ${product.title}*
Описание\\: ${this.escapeMarkDown(product.description ?? 'Не указано')}
Цена\\: ${this.escapeMarkDown(product.price.toFixed(2))} руб\\.
${product.quantity > 0 ? 'В наличии\\: ' + this.escapeMarkDown(String(product.quantity)) + ' шт\\.' : 'Нет в наличии'}`;
	}

	static escapeMarkDown(text: string): string {
		return text.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
	}
}
