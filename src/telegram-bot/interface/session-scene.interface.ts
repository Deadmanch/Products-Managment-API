import { Scenes } from 'telegraf';
import { IDeliveryAddress } from '../scenes/delivery/interface/delivery-address.interface';

export interface ISessionScene extends Scenes.SceneSessionData {
	deliveryAddress: IDeliveryAddress;
}
