import { Scenes } from 'telegraf';
import { CartType } from '../types/cart.type';
import { DeliveryAddressType } from '../types/delivery-address.type';
import { ISessionScene } from './session-scene.interface';

export interface ISession extends Scenes.SceneSession<ISessionScene> {
	deliveryAddress?: DeliveryAddressType;
	deliveryStep?: string | null;
	prodsPage?: number;
	cart: CartType;
}
