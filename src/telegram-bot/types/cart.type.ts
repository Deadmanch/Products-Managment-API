import { CartItemType } from './cart-item.type';
import { DeliveryAddressType } from './delivery-address.type';

export type CartType = {
	items: CartItemType[];
	deliveryAddress: DeliveryAddressType;
};
