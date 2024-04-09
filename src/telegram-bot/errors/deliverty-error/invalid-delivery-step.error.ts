import { INVALID_DELIVERY_STEP_MSG } from '../../scenes/delivery/delivery.dictionary';

export class InvalidDeliveryStepError extends Error {
	constructor() {
		super(INVALID_DELIVERY_STEP_MSG);
	}
}
