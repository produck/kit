interface KitProvider {
	(name: string): KitProvider & this;
	Kit: this;
}

export interface GlobalKit extends KitProvider {
	version: string;
}

export const Kit: GlobalKit;