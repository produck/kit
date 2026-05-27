export interface KitProvider {
  /**
   * Create a child Kit from this.
   * [ChildKit] --|> [This]
   *
   * @param name The name of this Kit. For debugging easily.
   */
  (name?: string): KitProvider & this;

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
 * A recipe function that receives a Kit instance and its call-site args.
 *
 * @template A - Tuple type of call-site arguments.
 * @template R - Return type of the recipe.
 */
type Recipe<A extends readonly unknown[] = readonly unknown[], R = unknown> = (
  kit: KitProvider,
  args: A,
) => R;

/**
 * Extract the call-site args tuple from a Recipe type.
 *
 * @template R - The recipe type to extract args from.
 */
type RecipeArgs<R extends Recipe> =
  R extends Recipe<infer A, unknown> ? A : never;

/**
 * Extract the return type from a Recipe type.
 *
 * @template T - The recipe type to extract return type from.
 */
type RecipeReturn<T extends Recipe> =
  T extends Recipe<readonly unknown[], infer R> ? R : never;

export interface KitInjector {
  /**
   * Bind a recipe with a pre-injected Kit.
   * Returns a function whose arguments are the recipe's call-site args.
   *
   * @template R - The recipe type.
   * @param recipe - The recipe to bind.
   */
  bind<R extends Recipe>(
    recipe: R,
  ): (...args: RecipeArgs<R>) => RecipeReturn<R>;
}

/**
 * Helper for downstream (non-TS) consumers to provide typed recipe functions.
 * Returns the same function but preserves the call-site argument tuple and
 * return types for TypeScript consumers that import the package's d.ts.
 *
 * Example:
 * ```ts
 * const recipe = defineRecipe((kit, args: [id: string]) => {
 *   const [id] = args;
 *   return { id };
 * });
 * // recipe has type (kit: KitProvider, args: [id: string]) => { id: string }
 * ```
 */
export function defineRecipe<
  A extends readonly unknown[] = readonly unknown[],
  R = unknown,
>(recipe: (kit: KitProvider, args: A) => R): (kit: KitProvider, args: A) => R;

export type KitDiagramFn = (kit: unknown) => string;

/**
 * Any new `Kit` MUST be created by the `global Kit`.
 */
export const global: GlobalKit;

export default global;

/**
 * Check if a value is a Kit proxy instance.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a Kit.
 */
export function isKit(value: unknown): value is KitProvider;

/**
 * Set a per-Kit error-message diagram renderer.
 * Pass no diagram argument to reset the given Kit to default (no output).
 *
 * @param kit - The Kit instance to configure.
 * @param diagram - The diagram renderer function, or omit to reset.
 */
export function setDiagram(kit: KitProvider, diagram?: KitDiagramFn): void;

/**
 * Create a KitInjector that validates required dependencies exist
 * on the given kit at construction time.
 *
 * @param kit - The Kit instance to inject. Defaults to `global`.
 * @param required - Array of property keys to validate.
 * @returns A KitInjector instance.
 */
export function Injector(
  kit?: KitProvider,
  required?: PropertyKey[],
): KitInjector;

/**
 * A typed accessor for a Kit property.
 *
 * @template T - The type of the property value.
 */
export interface KitGetter<T = unknown> {
  /**
   * Read the property from the given Kit.
   * Throws `ReferenceError` if the property is not found.
   *
   * @param kit - The Kit instance to read from.
   */
  use(kit: KitProvider): T;

  /**
   * Safely read the property from the given Kit.
   * Returns `undefined` if the property is not found.
   *
   * @param kit - The Kit instance to read from.
   */
  touch(kit: KitProvider): T | undefined;
}

/**
 * Create a typed accessor for a Kit property.
 * Designed for downstream libraries to destructure and re-export
 * the `use`/`touch` functions.
 *
 * @template T - The type of the property value.
 * @template P - The property key type (preserves `unique symbol` literals).
 * @param property - The property key to access.
 * @returns A KitGetter for the specified property.
 */
export function Getter<T = unknown, P extends PropertyKey = PropertyKey>(
  property: P,
): KitGetter<T>;
