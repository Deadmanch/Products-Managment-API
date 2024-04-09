export const DELIVERY_NAME = 'delivery';
export const SET_DELIVERY_MSG = 'Задать адрес доставки';
export const SET_NAME_MSG = 'Укажите свое имя:';
export const SET_CITY_MSG = 'Укажите город доставки:';
export const SET_STREET_MSG = 'Укажите улицу доставки:';
export const SET_BUILDING_MSG = 'Укажите номер дома/квартиры, с учетом номера корпуса, если есть:';
export const SET_DELIVERY_FINISHED_MSG = 'Адрес доставки успешно установлен';
export const INVALID_MSG_TYPE_ERROR = 'Неверный тип сообщения';
export const NOT_TEXT_MSG_ERROR = 'Сообщение должно быть текстовым';
export const INVALID_DELIVERY_STEP_MSG = 'Неизвестный тип заполнения данных';
export const SET_ADDRESS_ACTION = 'set_address';

export enum DeliveryStepEnum {
	ENTER_NAME = 'name',
	ENTER_CITY = 'city',
	ENTER_STREET = 'street',
	ENTER_BUILDING = 'building',
}
