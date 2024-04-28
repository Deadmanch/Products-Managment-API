export interface ICartItem {
	quantity: number;
}
export interface ICartItems {
	[productId: number]: ICartItem;
}
