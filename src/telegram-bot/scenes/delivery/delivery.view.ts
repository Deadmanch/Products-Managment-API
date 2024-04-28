import { IDeliveryAddress } from './interface/delivery-address.interface';

export class DeliveryView {
	static getDeliveryAddress(deliveryAddress: IDeliveryAddress): string {
		return `
*Мы помним твои данные:*
 Имя \\- *${this.escapeMarkdown(deliveryAddress.name ? deliveryAddress.name : '')}*

Адрес доставки:
🏙 Город \\- *${this.escapeMarkdown(deliveryAddress.city ? deliveryAddress.city : '')}*
🏠 Улица \\- *${this.escapeMarkdown(deliveryAddress.street ? deliveryAddress.street : '')}*
🏠 Номер дома/квартиры \\- *${this.escapeMarkdown(deliveryAddress.building ? deliveryAddress.building : '')}*`;
	}

	private static escapeMarkdown(text: string): string {
		return text.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
	}
}
