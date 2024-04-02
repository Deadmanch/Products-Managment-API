import { Decimal } from '@prisma/client/runtime/library';

export class Product {
	private readonly _title;
	private readonly _id: number;
	private readonly _description: string;
	private readonly _categoryId: number | null;
	private readonly _quantity;
	private readonly _price;
	private readonly _createdAt: Date;
	private readonly _updatedAt: Date;
	private readonly _isDeleted: boolean = false;

	constructor({
		title,
		description,
		price,
		quantity,
		categoryId,
		id,
	}: {
		title: string;
		description: string | null;
		price: Decimal;
		quantity: number;
		categoryId: number | null;
		id?: number;
	}) {
		this._title = title;
		this._price = price;
		this._quantity = quantity;
		this._description = description || '';
		this._categoryId = categoryId;
		if (id) {
			this._id = id;
		}
	}

	get isDeleted(): boolean {
		return this._isDeleted;
	}
	get id(): number {
		return this._id;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get title(): string {
		return this._title;
	}

	get description(): string {
		return this._description;
	}

	get categoryId(): number | null {
		return this._categoryId;
	}

	get price(): Decimal {
		return this._price;
	}

	get quantity(): number {
		return this._quantity;
	}
}
