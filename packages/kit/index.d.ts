interface KitProvider {
	/**
	 * @param name The name of this Kit. For debugging easily.
	 */
	(name: string): KitProvider & this;

	/**
	 * Create a child Kit from this.
	 * [ChildKit] --|> [This]
	 */
	Kit: this;
}

export interface GlobalKit extends KitProvider {
	/**
	 * The version of "@produck/kit".
	 */
	version: string;
}

export const global: GlobalKit;