import { Decimal } from '@prisma/client/runtime/library';

export type ProductCreateType = {
	title: string;
	categoryId?: number;
	description?: string;
	price: Decimal;
	quantity: number;
};
