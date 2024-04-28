import { Scenes } from 'telegraf';
import { ICart } from '../scenes/cart/interface/cart.interface';
import { IDeliveryAddress } from '../scenes/delivery/interface/delivery-address.interface';
import { ISessionScene } from './session-scene.interface';

export interface ISession extends Scenes.SceneSession<ISessionScene> {
	deliveryAddress: IDeliveryAddress;
	deliveryStep?: string | null;
	currentPage?: number;
	currentProductPage?: number;
	currentCategoryId: number;
	cart: ICart;
}
