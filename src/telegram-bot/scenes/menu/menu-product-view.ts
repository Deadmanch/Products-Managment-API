import { Product } from '../../../products/product.entity';

export class ProductView {
	static getListView(product: Product): string {
		return `*\n Наименование: ${product.title}*
		\nЦена\\: ${this.escapeMarkDown(product.price.toFixed(2))} руб\\.\n`;
	}

	static getCartListView(productName: string, quantity: number, totalPrice: number): string {
		return `*\n Наименование: ${productName}*
		\nКоличество\\: ${this.escapeMarkDown(String(quantity))} шт\\.
		\nЦена\\: ${this.escapeMarkDown(totalPrice.toFixed(2))} руб\\.\n`;
	}

	static getDetailView(product: Product): string {
		return `*\nНаименование: ${product.title}*\nОписание\\: ${this.escapeMarkDown(
			product.description ?? 'Не указано',
		)}\nЦена\\: ${this.escapeMarkDown(product.price.toFixed(2))} руб\\.
    \nВ наличии\\: ${this.escapeMarkDown(String(product.quantity))} шт\\.\n`;
	}

	static escapeMarkDown(text: string): string {
		return text.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
	}
}
