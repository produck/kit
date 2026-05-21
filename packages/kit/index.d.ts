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

type Recipe<
  A extends readonly unknown[] = readonly unknown[],
  R = unknown,
  TThis = unknown,
> = (this: TThis, kit: KitProvider, args: A) => R;

type RecipeArgs<R extends Recipe> =
  R extends Recipe<infer A, unknown, unknown> ? A : never;

type RecipeReturn<R extends Recipe> =
  R extends Recipe<readonly unknown[], infer A, unknown> ? A : never;

export interface KitInjector {
  bind<R extends Recipe>(
    recipe: R,
    thisArg?: ThisParameterType<R>,
  ): (...args: RecipeArgs<R>) => RecipeReturn<R>;
}

export type KitDiagramFn = (kit: unknown) => string;

/**
 * Any new `Kit` MUST be created by the `global Kit`.
 */
export const global: GlobalKit;

export default global;

export function isKit(value: unknown): value is KitProvider;

export function setDiagram(diagram?: KitDiagramFn): void;

export function Injector(
  kit?: KitProvider,
  required?: Array<string | symbol | number>,
): KitInjector;
