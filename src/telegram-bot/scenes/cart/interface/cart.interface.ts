import { IDeliveryAddress } from '../../delivery/interface/delivery-address.interface';
import { ICartItems } from './cart-item.interface';

export interface ICart {
	items: ICartItems;
	deliveryAddress: IDeliveryAddress;
}
