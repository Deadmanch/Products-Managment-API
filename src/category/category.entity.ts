export class Category {
	private readonly _name;
	private readonly _id: number;
	private readonly _isDeleted: boolean = false;

	constructor({ name, id }: { name: string; id?: number }) {
		this._name = name;
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

	get name(): string {
		return this._name;
	}
}
