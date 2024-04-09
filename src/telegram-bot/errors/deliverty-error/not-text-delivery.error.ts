import { NOT_TEXT_MSG_ERROR } from '../../scenes/delivery/delivery.dictionary';

export class NotTextDeliveryError extends Error {
	constructor() {
		super(NOT_TEXT_MSG_ERROR);
	}
}
