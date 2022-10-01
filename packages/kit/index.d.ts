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

/**
 * Any new `Kit` MUST be created by the `global Kit`.
 */
export const global: GlobalKit;