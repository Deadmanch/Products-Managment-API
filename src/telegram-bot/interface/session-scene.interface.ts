import { Scenes } from 'telegraf';
import { DeliveryAddressType } from '../types/delivery-address.type';

export interface ISessionScene extends Scenes.SceneSessionData {
	deliveryAddress?: DeliveryAddressType;
}
