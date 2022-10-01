interface KitProvider {
	/**
	 * Create a child Kit from this.
	 * [ChildKit] --|> [This]
	 *
	 * @param name The name of this Kit. For debugging easily.
	 */
	(name: string): KitProvider & this;

	/**
	 * A reference to self.
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