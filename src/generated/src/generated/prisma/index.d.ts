
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Mats
 * 
 */
export type Mats = $Result.DefaultSelection<Prisma.$MatsPayload>
/**
 * Model CarBrand
 * 
 */
export type CarBrand = $Result.DefaultSelection<Prisma.$CarBrandPayload>
/**
 * Model CarModel
 * 
 */
export type CarModel = $Result.DefaultSelection<Prisma.$CarModelPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Mats
 * const mats = await prisma.mats.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Mats
   * const mats = await prisma.mats.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.mats`: Exposes CRUD operations for the **Mats** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Mats
    * const mats = await prisma.mats.findMany()
    * ```
    */
  get mats(): Prisma.MatsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.carBrand`: Exposes CRUD operations for the **CarBrand** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CarBrands
    * const carBrands = await prisma.carBrand.findMany()
    * ```
    */
  get carBrand(): Prisma.CarBrandDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.carModel`: Exposes CRUD operations for the **CarModel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CarModels
    * const carModels = await prisma.carModel.findMany()
    * ```
    */
  get carModel(): Prisma.CarModelDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.11.1
   * Query Engine version: f40f79ec31188888a2e33acda0ecc8fd10a853a9
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Mats: 'Mats',
    CarBrand: 'CarBrand',
    CarModel: 'CarModel'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "mats" | "carBrand" | "carModel"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Mats: {
        payload: Prisma.$MatsPayload<ExtArgs>
        fields: Prisma.MatsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MatsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MatsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatsPayload>
          }
          findFirst: {
            args: Prisma.MatsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MatsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatsPayload>
          }
          findMany: {
            args: Prisma.MatsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatsPayload>[]
          }
          create: {
            args: Prisma.MatsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatsPayload>
          }
          createMany: {
            args: Prisma.MatsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MatsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatsPayload>[]
          }
          delete: {
            args: Prisma.MatsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatsPayload>
          }
          update: {
            args: Prisma.MatsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatsPayload>
          }
          deleteMany: {
            args: Prisma.MatsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MatsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MatsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatsPayload>[]
          }
          upsert: {
            args: Prisma.MatsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MatsPayload>
          }
          aggregate: {
            args: Prisma.MatsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMats>
          }
          groupBy: {
            args: Prisma.MatsGroupByArgs<ExtArgs>
            result: $Utils.Optional<MatsGroupByOutputType>[]
          }
          count: {
            args: Prisma.MatsCountArgs<ExtArgs>
            result: $Utils.Optional<MatsCountAggregateOutputType> | number
          }
        }
      }
      CarBrand: {
        payload: Prisma.$CarBrandPayload<ExtArgs>
        fields: Prisma.CarBrandFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CarBrandFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarBrandPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CarBrandFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarBrandPayload>
          }
          findFirst: {
            args: Prisma.CarBrandFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarBrandPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CarBrandFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarBrandPayload>
          }
          findMany: {
            args: Prisma.CarBrandFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarBrandPayload>[]
          }
          create: {
            args: Prisma.CarBrandCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarBrandPayload>
          }
          createMany: {
            args: Prisma.CarBrandCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CarBrandCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarBrandPayload>[]
          }
          delete: {
            args: Prisma.CarBrandDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarBrandPayload>
          }
          update: {
            args: Prisma.CarBrandUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarBrandPayload>
          }
          deleteMany: {
            args: Prisma.CarBrandDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CarBrandUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CarBrandUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarBrandPayload>[]
          }
          upsert: {
            args: Prisma.CarBrandUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarBrandPayload>
          }
          aggregate: {
            args: Prisma.CarBrandAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCarBrand>
          }
          groupBy: {
            args: Prisma.CarBrandGroupByArgs<ExtArgs>
            result: $Utils.Optional<CarBrandGroupByOutputType>[]
          }
          count: {
            args: Prisma.CarBrandCountArgs<ExtArgs>
            result: $Utils.Optional<CarBrandCountAggregateOutputType> | number
          }
        }
      }
      CarModel: {
        payload: Prisma.$CarModelPayload<ExtArgs>
        fields: Prisma.CarModelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CarModelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarModelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CarModelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarModelPayload>
          }
          findFirst: {
            args: Prisma.CarModelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarModelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CarModelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarModelPayload>
          }
          findMany: {
            args: Prisma.CarModelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarModelPayload>[]
          }
          create: {
            args: Prisma.CarModelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarModelPayload>
          }
          createMany: {
            args: Prisma.CarModelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CarModelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarModelPayload>[]
          }
          delete: {
            args: Prisma.CarModelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarModelPayload>
          }
          update: {
            args: Prisma.CarModelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarModelPayload>
          }
          deleteMany: {
            args: Prisma.CarModelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CarModelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CarModelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarModelPayload>[]
          }
          upsert: {
            args: Prisma.CarModelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CarModelPayload>
          }
          aggregate: {
            args: Prisma.CarModelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCarModel>
          }
          groupBy: {
            args: Prisma.CarModelGroupByArgs<ExtArgs>
            result: $Utils.Optional<CarModelGroupByOutputType>[]
          }
          count: {
            args: Prisma.CarModelCountArgs<ExtArgs>
            result: $Utils.Optional<CarModelCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    mats?: MatsOmit
    carBrand?: CarBrandOmit
    carModel?: CarModelOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CarBrandCountOutputType
   */

  export type CarBrandCountOutputType = {
    carModels: number
  }

  export type CarBrandCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carModels?: boolean | CarBrandCountOutputTypeCountCarModelsArgs
  }

  // Custom InputTypes
  /**
   * CarBrandCountOutputType without action
   */
  export type CarBrandCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarBrandCountOutputType
     */
    select?: CarBrandCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CarBrandCountOutputType without action
   */
  export type CarBrandCountOutputTypeCountCarModelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CarModelWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Mats
   */

  export type AggregateMats = {
    _count: MatsCountAggregateOutputType | null
    _avg: MatsAvgAggregateOutputType | null
    _sum: MatsSumAggregateOutputType | null
    _min: MatsMinAggregateOutputType | null
    _max: MatsMaxAggregateOutputType | null
  }

  export type MatsAvgAggregateOutputType = {
    id: number | null
  }

  export type MatsSumAggregateOutputType = {
    id: number | null
  }

  export type MatsMinAggregateOutputType = {
    id: number | null
    type: string | null
    color: string | null
    cellType: string | null
    edgeColor: string | null
    image: string | null
  }

  export type MatsMaxAggregateOutputType = {
    id: number | null
    type: string | null
    color: string | null
    cellType: string | null
    edgeColor: string | null
    image: string | null
  }

  export type MatsCountAggregateOutputType = {
    id: number
    type: number
    color: number
    cellType: number
    edgeColor: number
    image: number
    _all: number
  }


  export type MatsAvgAggregateInputType = {
    id?: true
  }

  export type MatsSumAggregateInputType = {
    id?: true
  }

  export type MatsMinAggregateInputType = {
    id?: true
    type?: true
    color?: true
    cellType?: true
    edgeColor?: true
    image?: true
  }

  export type MatsMaxAggregateInputType = {
    id?: true
    type?: true
    color?: true
    cellType?: true
    edgeColor?: true
    image?: true
  }

  export type MatsCountAggregateInputType = {
    id?: true
    type?: true
    color?: true
    cellType?: true
    edgeColor?: true
    image?: true
    _all?: true
  }

  export type MatsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Mats to aggregate.
     */
    where?: MatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Mats to fetch.
     */
    orderBy?: MatsOrderByWithRelationInput | MatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Mats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Mats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Mats
    **/
    _count?: true | MatsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MatsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MatsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MatsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MatsMaxAggregateInputType
  }

  export type GetMatsAggregateType<T extends MatsAggregateArgs> = {
        [P in keyof T & keyof AggregateMats]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMats[P]>
      : GetScalarType<T[P], AggregateMats[P]>
  }




  export type MatsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MatsWhereInput
    orderBy?: MatsOrderByWithAggregationInput | MatsOrderByWithAggregationInput[]
    by: MatsScalarFieldEnum[] | MatsScalarFieldEnum
    having?: MatsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MatsCountAggregateInputType | true
    _avg?: MatsAvgAggregateInputType
    _sum?: MatsSumAggregateInputType
    _min?: MatsMinAggregateInputType
    _max?: MatsMaxAggregateInputType
  }

  export type MatsGroupByOutputType = {
    id: number
    type: string
    color: string
    cellType: string
    edgeColor: string
    image: string
    _count: MatsCountAggregateOutputType | null
    _avg: MatsAvgAggregateOutputType | null
    _sum: MatsSumAggregateOutputType | null
    _min: MatsMinAggregateOutputType | null
    _max: MatsMaxAggregateOutputType | null
  }

  type GetMatsGroupByPayload<T extends MatsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MatsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MatsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MatsGroupByOutputType[P]>
            : GetScalarType<T[P], MatsGroupByOutputType[P]>
        }
      >
    >


  export type MatsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    color?: boolean
    cellType?: boolean
    edgeColor?: boolean
    image?: boolean
  }, ExtArgs["result"]["mats"]>

  export type MatsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    color?: boolean
    cellType?: boolean
    edgeColor?: boolean
    image?: boolean
  }, ExtArgs["result"]["mats"]>

  export type MatsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    color?: boolean
    cellType?: boolean
    edgeColor?: boolean
    image?: boolean
  }, ExtArgs["result"]["mats"]>

  export type MatsSelectScalar = {
    id?: boolean
    type?: boolean
    color?: boolean
    cellType?: boolean
    edgeColor?: boolean
    image?: boolean
  }

  export type MatsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "type" | "color" | "cellType" | "edgeColor" | "image", ExtArgs["result"]["mats"]>

  export type $MatsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Mats"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      type: string
      color: string
      cellType: string
      edgeColor: string
      image: string
    }, ExtArgs["result"]["mats"]>
    composites: {}
  }

  type MatsGetPayload<S extends boolean | null | undefined | MatsDefaultArgs> = $Result.GetResult<Prisma.$MatsPayload, S>

  type MatsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MatsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MatsCountAggregateInputType | true
    }

  export interface MatsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Mats'], meta: { name: 'Mats' } }
    /**
     * Find zero or one Mats that matches the filter.
     * @param {MatsFindUniqueArgs} args - Arguments to find a Mats
     * @example
     * // Get one Mats
     * const mats = await prisma.mats.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MatsFindUniqueArgs>(args: SelectSubset<T, MatsFindUniqueArgs<ExtArgs>>): Prisma__MatsClient<$Result.GetResult<Prisma.$MatsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Mats that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MatsFindUniqueOrThrowArgs} args - Arguments to find a Mats
     * @example
     * // Get one Mats
     * const mats = await prisma.mats.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MatsFindUniqueOrThrowArgs>(args: SelectSubset<T, MatsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MatsClient<$Result.GetResult<Prisma.$MatsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Mats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatsFindFirstArgs} args - Arguments to find a Mats
     * @example
     * // Get one Mats
     * const mats = await prisma.mats.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MatsFindFirstArgs>(args?: SelectSubset<T, MatsFindFirstArgs<ExtArgs>>): Prisma__MatsClient<$Result.GetResult<Prisma.$MatsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Mats that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatsFindFirstOrThrowArgs} args - Arguments to find a Mats
     * @example
     * // Get one Mats
     * const mats = await prisma.mats.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MatsFindFirstOrThrowArgs>(args?: SelectSubset<T, MatsFindFirstOrThrowArgs<ExtArgs>>): Prisma__MatsClient<$Result.GetResult<Prisma.$MatsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Mats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Mats
     * const mats = await prisma.mats.findMany()
     * 
     * // Get first 10 Mats
     * const mats = await prisma.mats.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const matsWithIdOnly = await prisma.mats.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MatsFindManyArgs>(args?: SelectSubset<T, MatsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Mats.
     * @param {MatsCreateArgs} args - Arguments to create a Mats.
     * @example
     * // Create one Mats
     * const Mats = await prisma.mats.create({
     *   data: {
     *     // ... data to create a Mats
     *   }
     * })
     * 
     */
    create<T extends MatsCreateArgs>(args: SelectSubset<T, MatsCreateArgs<ExtArgs>>): Prisma__MatsClient<$Result.GetResult<Prisma.$MatsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Mats.
     * @param {MatsCreateManyArgs} args - Arguments to create many Mats.
     * @example
     * // Create many Mats
     * const mats = await prisma.mats.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MatsCreateManyArgs>(args?: SelectSubset<T, MatsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Mats and returns the data saved in the database.
     * @param {MatsCreateManyAndReturnArgs} args - Arguments to create many Mats.
     * @example
     * // Create many Mats
     * const mats = await prisma.mats.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Mats and only return the `id`
     * const matsWithIdOnly = await prisma.mats.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MatsCreateManyAndReturnArgs>(args?: SelectSubset<T, MatsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Mats.
     * @param {MatsDeleteArgs} args - Arguments to delete one Mats.
     * @example
     * // Delete one Mats
     * const Mats = await prisma.mats.delete({
     *   where: {
     *     // ... filter to delete one Mats
     *   }
     * })
     * 
     */
    delete<T extends MatsDeleteArgs>(args: SelectSubset<T, MatsDeleteArgs<ExtArgs>>): Prisma__MatsClient<$Result.GetResult<Prisma.$MatsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Mats.
     * @param {MatsUpdateArgs} args - Arguments to update one Mats.
     * @example
     * // Update one Mats
     * const mats = await prisma.mats.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MatsUpdateArgs>(args: SelectSubset<T, MatsUpdateArgs<ExtArgs>>): Prisma__MatsClient<$Result.GetResult<Prisma.$MatsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Mats.
     * @param {MatsDeleteManyArgs} args - Arguments to filter Mats to delete.
     * @example
     * // Delete a few Mats
     * const { count } = await prisma.mats.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MatsDeleteManyArgs>(args?: SelectSubset<T, MatsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Mats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Mats
     * const mats = await prisma.mats.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MatsUpdateManyArgs>(args: SelectSubset<T, MatsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Mats and returns the data updated in the database.
     * @param {MatsUpdateManyAndReturnArgs} args - Arguments to update many Mats.
     * @example
     * // Update many Mats
     * const mats = await prisma.mats.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Mats and only return the `id`
     * const matsWithIdOnly = await prisma.mats.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MatsUpdateManyAndReturnArgs>(args: SelectSubset<T, MatsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MatsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Mats.
     * @param {MatsUpsertArgs} args - Arguments to update or create a Mats.
     * @example
     * // Update or create a Mats
     * const mats = await prisma.mats.upsert({
     *   create: {
     *     // ... data to create a Mats
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Mats we want to update
     *   }
     * })
     */
    upsert<T extends MatsUpsertArgs>(args: SelectSubset<T, MatsUpsertArgs<ExtArgs>>): Prisma__MatsClient<$Result.GetResult<Prisma.$MatsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Mats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatsCountArgs} args - Arguments to filter Mats to count.
     * @example
     * // Count the number of Mats
     * const count = await prisma.mats.count({
     *   where: {
     *     // ... the filter for the Mats we want to count
     *   }
     * })
    **/
    count<T extends MatsCountArgs>(
      args?: Subset<T, MatsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MatsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Mats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MatsAggregateArgs>(args: Subset<T, MatsAggregateArgs>): Prisma.PrismaPromise<GetMatsAggregateType<T>>

    /**
     * Group by Mats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MatsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MatsGroupByArgs['orderBy'] }
        : { orderBy?: MatsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MatsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMatsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Mats model
   */
  readonly fields: MatsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Mats.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MatsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Mats model
   */
  interface MatsFieldRefs {
    readonly id: FieldRef<"Mats", 'Int'>
    readonly type: FieldRef<"Mats", 'String'>
    readonly color: FieldRef<"Mats", 'String'>
    readonly cellType: FieldRef<"Mats", 'String'>
    readonly edgeColor: FieldRef<"Mats", 'String'>
    readonly image: FieldRef<"Mats", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Mats findUnique
   */
  export type MatsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mats
     */
    select?: MatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mats
     */
    omit?: MatsOmit<ExtArgs> | null
    /**
     * Filter, which Mats to fetch.
     */
    where: MatsWhereUniqueInput
  }

  /**
   * Mats findUniqueOrThrow
   */
  export type MatsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mats
     */
    select?: MatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mats
     */
    omit?: MatsOmit<ExtArgs> | null
    /**
     * Filter, which Mats to fetch.
     */
    where: MatsWhereUniqueInput
  }

  /**
   * Mats findFirst
   */
  export type MatsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mats
     */
    select?: MatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mats
     */
    omit?: MatsOmit<ExtArgs> | null
    /**
     * Filter, which Mats to fetch.
     */
    where?: MatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Mats to fetch.
     */
    orderBy?: MatsOrderByWithRelationInput | MatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Mats.
     */
    cursor?: MatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Mats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Mats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Mats.
     */
    distinct?: MatsScalarFieldEnum | MatsScalarFieldEnum[]
  }

  /**
   * Mats findFirstOrThrow
   */
  export type MatsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mats
     */
    select?: MatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mats
     */
    omit?: MatsOmit<ExtArgs> | null
    /**
     * Filter, which Mats to fetch.
     */
    where?: MatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Mats to fetch.
     */
    orderBy?: MatsOrderByWithRelationInput | MatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Mats.
     */
    cursor?: MatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Mats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Mats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Mats.
     */
    distinct?: MatsScalarFieldEnum | MatsScalarFieldEnum[]
  }

  /**
   * Mats findMany
   */
  export type MatsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mats
     */
    select?: MatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mats
     */
    omit?: MatsOmit<ExtArgs> | null
    /**
     * Filter, which Mats to fetch.
     */
    where?: MatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Mats to fetch.
     */
    orderBy?: MatsOrderByWithRelationInput | MatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Mats.
     */
    cursor?: MatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Mats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Mats.
     */
    skip?: number
    distinct?: MatsScalarFieldEnum | MatsScalarFieldEnum[]
  }

  /**
   * Mats create
   */
  export type MatsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mats
     */
    select?: MatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mats
     */
    omit?: MatsOmit<ExtArgs> | null
    /**
     * The data needed to create a Mats.
     */
    data: XOR<MatsCreateInput, MatsUncheckedCreateInput>
  }

  /**
   * Mats createMany
   */
  export type MatsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Mats.
     */
    data: MatsCreateManyInput | MatsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Mats createManyAndReturn
   */
  export type MatsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mats
     */
    select?: MatsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Mats
     */
    omit?: MatsOmit<ExtArgs> | null
    /**
     * The data used to create many Mats.
     */
    data: MatsCreateManyInput | MatsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Mats update
   */
  export type MatsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mats
     */
    select?: MatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mats
     */
    omit?: MatsOmit<ExtArgs> | null
    /**
     * The data needed to update a Mats.
     */
    data: XOR<MatsUpdateInput, MatsUncheckedUpdateInput>
    /**
     * Choose, which Mats to update.
     */
    where: MatsWhereUniqueInput
  }

  /**
   * Mats updateMany
   */
  export type MatsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Mats.
     */
    data: XOR<MatsUpdateManyMutationInput, MatsUncheckedUpdateManyInput>
    /**
     * Filter which Mats to update
     */
    where?: MatsWhereInput
    /**
     * Limit how many Mats to update.
     */
    limit?: number
  }

  /**
   * Mats updateManyAndReturn
   */
  export type MatsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mats
     */
    select?: MatsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Mats
     */
    omit?: MatsOmit<ExtArgs> | null
    /**
     * The data used to update Mats.
     */
    data: XOR<MatsUpdateManyMutationInput, MatsUncheckedUpdateManyInput>
    /**
     * Filter which Mats to update
     */
    where?: MatsWhereInput
    /**
     * Limit how many Mats to update.
     */
    limit?: number
  }

  /**
   * Mats upsert
   */
  export type MatsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mats
     */
    select?: MatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mats
     */
    omit?: MatsOmit<ExtArgs> | null
    /**
     * The filter to search for the Mats to update in case it exists.
     */
    where: MatsWhereUniqueInput
    /**
     * In case the Mats found by the `where` argument doesn't exist, create a new Mats with this data.
     */
    create: XOR<MatsCreateInput, MatsUncheckedCreateInput>
    /**
     * In case the Mats was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MatsUpdateInput, MatsUncheckedUpdateInput>
  }

  /**
   * Mats delete
   */
  export type MatsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mats
     */
    select?: MatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mats
     */
    omit?: MatsOmit<ExtArgs> | null
    /**
     * Filter which Mats to delete.
     */
    where: MatsWhereUniqueInput
  }

  /**
   * Mats deleteMany
   */
  export type MatsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Mats to delete
     */
    where?: MatsWhereInput
    /**
     * Limit how many Mats to delete.
     */
    limit?: number
  }

  /**
   * Mats without action
   */
  export type MatsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mats
     */
    select?: MatsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mats
     */
    omit?: MatsOmit<ExtArgs> | null
  }


  /**
   * Model CarBrand
   */

  export type AggregateCarBrand = {
    _count: CarBrandCountAggregateOutputType | null
    _avg: CarBrandAvgAggregateOutputType | null
    _sum: CarBrandSumAggregateOutputType | null
    _min: CarBrandMinAggregateOutputType | null
    _max: CarBrandMaxAggregateOutputType | null
  }

  export type CarBrandAvgAggregateOutputType = {
    id: number | null
  }

  export type CarBrandSumAggregateOutputType = {
    id: number | null
  }

  export type CarBrandMinAggregateOutputType = {
    id: number | null
    name: string | null
    displayName: string | null
    logo: string | null
    description: string | null
    website: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CarBrandMaxAggregateOutputType = {
    id: number | null
    name: string | null
    displayName: string | null
    logo: string | null
    description: string | null
    website: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CarBrandCountAggregateOutputType = {
    id: number
    name: number
    displayName: number
    logo: number
    description: number
    website: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CarBrandAvgAggregateInputType = {
    id?: true
  }

  export type CarBrandSumAggregateInputType = {
    id?: true
  }

  export type CarBrandMinAggregateInputType = {
    id?: true
    name?: true
    displayName?: true
    logo?: true
    description?: true
    website?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CarBrandMaxAggregateInputType = {
    id?: true
    name?: true
    displayName?: true
    logo?: true
    description?: true
    website?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CarBrandCountAggregateInputType = {
    id?: true
    name?: true
    displayName?: true
    logo?: true
    description?: true
    website?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CarBrandAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CarBrand to aggregate.
     */
    where?: CarBrandWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CarBrands to fetch.
     */
    orderBy?: CarBrandOrderByWithRelationInput | CarBrandOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CarBrandWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CarBrands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CarBrands.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CarBrands
    **/
    _count?: true | CarBrandCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CarBrandAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CarBrandSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CarBrandMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CarBrandMaxAggregateInputType
  }

  export type GetCarBrandAggregateType<T extends CarBrandAggregateArgs> = {
        [P in keyof T & keyof AggregateCarBrand]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCarBrand[P]>
      : GetScalarType<T[P], AggregateCarBrand[P]>
  }




  export type CarBrandGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CarBrandWhereInput
    orderBy?: CarBrandOrderByWithAggregationInput | CarBrandOrderByWithAggregationInput[]
    by: CarBrandScalarFieldEnum[] | CarBrandScalarFieldEnum
    having?: CarBrandScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CarBrandCountAggregateInputType | true
    _avg?: CarBrandAvgAggregateInputType
    _sum?: CarBrandSumAggregateInputType
    _min?: CarBrandMinAggregateInputType
    _max?: CarBrandMaxAggregateInputType
  }

  export type CarBrandGroupByOutputType = {
    id: number
    name: string
    displayName: string | null
    logo: string | null
    description: string | null
    website: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: CarBrandCountAggregateOutputType | null
    _avg: CarBrandAvgAggregateOutputType | null
    _sum: CarBrandSumAggregateOutputType | null
    _min: CarBrandMinAggregateOutputType | null
    _max: CarBrandMaxAggregateOutputType | null
  }

  type GetCarBrandGroupByPayload<T extends CarBrandGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CarBrandGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CarBrandGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CarBrandGroupByOutputType[P]>
            : GetScalarType<T[P], CarBrandGroupByOutputType[P]>
        }
      >
    >


  export type CarBrandSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    displayName?: boolean
    logo?: boolean
    description?: boolean
    website?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    carModels?: boolean | CarBrand$carModelsArgs<ExtArgs>
    _count?: boolean | CarBrandCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["carBrand"]>

  export type CarBrandSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    displayName?: boolean
    logo?: boolean
    description?: boolean
    website?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["carBrand"]>

  export type CarBrandSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    displayName?: boolean
    logo?: boolean
    description?: boolean
    website?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["carBrand"]>

  export type CarBrandSelectScalar = {
    id?: boolean
    name?: boolean
    displayName?: boolean
    logo?: boolean
    description?: boolean
    website?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CarBrandOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "displayName" | "logo" | "description" | "website" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["carBrand"]>
  export type CarBrandInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carModels?: boolean | CarBrand$carModelsArgs<ExtArgs>
    _count?: boolean | CarBrandCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CarBrandIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CarBrandIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CarBrandPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CarBrand"
    objects: {
      carModels: Prisma.$CarModelPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      displayName: string | null
      logo: string | null
      description: string | null
      website: string | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["carBrand"]>
    composites: {}
  }

  type CarBrandGetPayload<S extends boolean | null | undefined | CarBrandDefaultArgs> = $Result.GetResult<Prisma.$CarBrandPayload, S>

  type CarBrandCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CarBrandFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CarBrandCountAggregateInputType | true
    }

  export interface CarBrandDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CarBrand'], meta: { name: 'CarBrand' } }
    /**
     * Find zero or one CarBrand that matches the filter.
     * @param {CarBrandFindUniqueArgs} args - Arguments to find a CarBrand
     * @example
     * // Get one CarBrand
     * const carBrand = await prisma.carBrand.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CarBrandFindUniqueArgs>(args: SelectSubset<T, CarBrandFindUniqueArgs<ExtArgs>>): Prisma__CarBrandClient<$Result.GetResult<Prisma.$CarBrandPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CarBrand that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CarBrandFindUniqueOrThrowArgs} args - Arguments to find a CarBrand
     * @example
     * // Get one CarBrand
     * const carBrand = await prisma.carBrand.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CarBrandFindUniqueOrThrowArgs>(args: SelectSubset<T, CarBrandFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CarBrandClient<$Result.GetResult<Prisma.$CarBrandPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CarBrand that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CarBrandFindFirstArgs} args - Arguments to find a CarBrand
     * @example
     * // Get one CarBrand
     * const carBrand = await prisma.carBrand.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CarBrandFindFirstArgs>(args?: SelectSubset<T, CarBrandFindFirstArgs<ExtArgs>>): Prisma__CarBrandClient<$Result.GetResult<Prisma.$CarBrandPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CarBrand that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CarBrandFindFirstOrThrowArgs} args - Arguments to find a CarBrand
     * @example
     * // Get one CarBrand
     * const carBrand = await prisma.carBrand.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CarBrandFindFirstOrThrowArgs>(args?: SelectSubset<T, CarBrandFindFirstOrThrowArgs<ExtArgs>>): Prisma__CarBrandClient<$Result.GetResult<Prisma.$CarBrandPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CarBrands that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CarBrandFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CarBrands
     * const carBrands = await prisma.carBrand.findMany()
     * 
     * // Get first 10 CarBrands
     * const carBrands = await prisma.carBrand.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const carBrandWithIdOnly = await prisma.carBrand.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CarBrandFindManyArgs>(args?: SelectSubset<T, CarBrandFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CarBrandPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CarBrand.
     * @param {CarBrandCreateArgs} args - Arguments to create a CarBrand.
     * @example
     * // Create one CarBrand
     * const CarBrand = await prisma.carBrand.create({
     *   data: {
     *     // ... data to create a CarBrand
     *   }
     * })
     * 
     */
    create<T extends CarBrandCreateArgs>(args: SelectSubset<T, CarBrandCreateArgs<ExtArgs>>): Prisma__CarBrandClient<$Result.GetResult<Prisma.$CarBrandPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CarBrands.
     * @param {CarBrandCreateManyArgs} args - Arguments to create many CarBrands.
     * @example
     * // Create many CarBrands
     * const carBrand = await prisma.carBrand.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CarBrandCreateManyArgs>(args?: SelectSubset<T, CarBrandCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CarBrands and returns the data saved in the database.
     * @param {CarBrandCreateManyAndReturnArgs} args - Arguments to create many CarBrands.
     * @example
     * // Create many CarBrands
     * const carBrand = await prisma.carBrand.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CarBrands and only return the `id`
     * const carBrandWithIdOnly = await prisma.carBrand.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CarBrandCreateManyAndReturnArgs>(args?: SelectSubset<T, CarBrandCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CarBrandPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CarBrand.
     * @param {CarBrandDeleteArgs} args - Arguments to delete one CarBrand.
     * @example
     * // Delete one CarBrand
     * const CarBrand = await prisma.carBrand.delete({
     *   where: {
     *     // ... filter to delete one CarBrand
     *   }
     * })
     * 
     */
    delete<T extends CarBrandDeleteArgs>(args: SelectSubset<T, CarBrandDeleteArgs<ExtArgs>>): Prisma__CarBrandClient<$Result.GetResult<Prisma.$CarBrandPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CarBrand.
     * @param {CarBrandUpdateArgs} args - Arguments to update one CarBrand.
     * @example
     * // Update one CarBrand
     * const carBrand = await prisma.carBrand.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CarBrandUpdateArgs>(args: SelectSubset<T, CarBrandUpdateArgs<ExtArgs>>): Prisma__CarBrandClient<$Result.GetResult<Prisma.$CarBrandPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CarBrands.
     * @param {CarBrandDeleteManyArgs} args - Arguments to filter CarBrands to delete.
     * @example
     * // Delete a few CarBrands
     * const { count } = await prisma.carBrand.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CarBrandDeleteManyArgs>(args?: SelectSubset<T, CarBrandDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CarBrands.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CarBrandUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CarBrands
     * const carBrand = await prisma.carBrand.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CarBrandUpdateManyArgs>(args: SelectSubset<T, CarBrandUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CarBrands and returns the data updated in the database.
     * @param {CarBrandUpdateManyAndReturnArgs} args - Arguments to update many CarBrands.
     * @example
     * // Update many CarBrands
     * const carBrand = await prisma.carBrand.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CarBrands and only return the `id`
     * const carBrandWithIdOnly = await prisma.carBrand.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CarBrandUpdateManyAndReturnArgs>(args: SelectSubset<T, CarBrandUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CarBrandPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CarBrand.
     * @param {CarBrandUpsertArgs} args - Arguments to update or create a CarBrand.
     * @example
     * // Update or create a CarBrand
     * const carBrand = await prisma.carBrand.upsert({
     *   create: {
     *     // ... data to create a CarBrand
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CarBrand we want to update
     *   }
     * })
     */
    upsert<T extends CarBrandUpsertArgs>(args: SelectSubset<T, CarBrandUpsertArgs<ExtArgs>>): Prisma__CarBrandClient<$Result.GetResult<Prisma.$CarBrandPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CarBrands.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CarBrandCountArgs} args - Arguments to filter CarBrands to count.
     * @example
     * // Count the number of CarBrands
     * const count = await prisma.carBrand.count({
     *   where: {
     *     // ... the filter for the CarBrands we want to count
     *   }
     * })
    **/
    count<T extends CarBrandCountArgs>(
      args?: Subset<T, CarBrandCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CarBrandCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CarBrand.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CarBrandAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CarBrandAggregateArgs>(args: Subset<T, CarBrandAggregateArgs>): Prisma.PrismaPromise<GetCarBrandAggregateType<T>>

    /**
     * Group by CarBrand.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CarBrandGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CarBrandGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CarBrandGroupByArgs['orderBy'] }
        : { orderBy?: CarBrandGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CarBrandGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCarBrandGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CarBrand model
   */
  readonly fields: CarBrandFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CarBrand.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CarBrandClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    carModels<T extends CarBrand$carModelsArgs<ExtArgs> = {}>(args?: Subset<T, CarBrand$carModelsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CarModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CarBrand model
   */
  interface CarBrandFieldRefs {
    readonly id: FieldRef<"CarBrand", 'Int'>
    readonly name: FieldRef<"CarBrand", 'String'>
    readonly displayName: FieldRef<"CarBrand", 'String'>
    readonly logo: FieldRef<"CarBrand", 'String'>
    readonly description: FieldRef<"CarBrand", 'String'>
    readonly website: FieldRef<"CarBrand", 'String'>
    readonly isActive: FieldRef<"CarBrand", 'Boolean'>
    readonly createdAt: FieldRef<"CarBrand", 'DateTime'>
    readonly updatedAt: FieldRef<"CarBrand", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CarBrand findUnique
   */
  export type CarBrandFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarBrand
     */
    select?: CarBrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarBrand
     */
    omit?: CarBrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarBrandInclude<ExtArgs> | null
    /**
     * Filter, which CarBrand to fetch.
     */
    where: CarBrandWhereUniqueInput
  }

  /**
   * CarBrand findUniqueOrThrow
   */
  export type CarBrandFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarBrand
     */
    select?: CarBrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarBrand
     */
    omit?: CarBrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarBrandInclude<ExtArgs> | null
    /**
     * Filter, which CarBrand to fetch.
     */
    where: CarBrandWhereUniqueInput
  }

  /**
   * CarBrand findFirst
   */
  export type CarBrandFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarBrand
     */
    select?: CarBrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarBrand
     */
    omit?: CarBrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarBrandInclude<ExtArgs> | null
    /**
     * Filter, which CarBrand to fetch.
     */
    where?: CarBrandWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CarBrands to fetch.
     */
    orderBy?: CarBrandOrderByWithRelationInput | CarBrandOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CarBrands.
     */
    cursor?: CarBrandWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CarBrands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CarBrands.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CarBrands.
     */
    distinct?: CarBrandScalarFieldEnum | CarBrandScalarFieldEnum[]
  }

  /**
   * CarBrand findFirstOrThrow
   */
  export type CarBrandFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarBrand
     */
    select?: CarBrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarBrand
     */
    omit?: CarBrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarBrandInclude<ExtArgs> | null
    /**
     * Filter, which CarBrand to fetch.
     */
    where?: CarBrandWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CarBrands to fetch.
     */
    orderBy?: CarBrandOrderByWithRelationInput | CarBrandOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CarBrands.
     */
    cursor?: CarBrandWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CarBrands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CarBrands.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CarBrands.
     */
    distinct?: CarBrandScalarFieldEnum | CarBrandScalarFieldEnum[]
  }

  /**
   * CarBrand findMany
   */
  export type CarBrandFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarBrand
     */
    select?: CarBrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarBrand
     */
    omit?: CarBrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarBrandInclude<ExtArgs> | null
    /**
     * Filter, which CarBrands to fetch.
     */
    where?: CarBrandWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CarBrands to fetch.
     */
    orderBy?: CarBrandOrderByWithRelationInput | CarBrandOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CarBrands.
     */
    cursor?: CarBrandWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CarBrands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CarBrands.
     */
    skip?: number
    distinct?: CarBrandScalarFieldEnum | CarBrandScalarFieldEnum[]
  }

  /**
   * CarBrand create
   */
  export type CarBrandCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarBrand
     */
    select?: CarBrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarBrand
     */
    omit?: CarBrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarBrandInclude<ExtArgs> | null
    /**
     * The data needed to create a CarBrand.
     */
    data: XOR<CarBrandCreateInput, CarBrandUncheckedCreateInput>
  }

  /**
   * CarBrand createMany
   */
  export type CarBrandCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CarBrands.
     */
    data: CarBrandCreateManyInput | CarBrandCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CarBrand createManyAndReturn
   */
  export type CarBrandCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarBrand
     */
    select?: CarBrandSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CarBrand
     */
    omit?: CarBrandOmit<ExtArgs> | null
    /**
     * The data used to create many CarBrands.
     */
    data: CarBrandCreateManyInput | CarBrandCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CarBrand update
   */
  export type CarBrandUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarBrand
     */
    select?: CarBrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarBrand
     */
    omit?: CarBrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarBrandInclude<ExtArgs> | null
    /**
     * The data needed to update a CarBrand.
     */
    data: XOR<CarBrandUpdateInput, CarBrandUncheckedUpdateInput>
    /**
     * Choose, which CarBrand to update.
     */
    where: CarBrandWhereUniqueInput
  }

  /**
   * CarBrand updateMany
   */
  export type CarBrandUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CarBrands.
     */
    data: XOR<CarBrandUpdateManyMutationInput, CarBrandUncheckedUpdateManyInput>
    /**
     * Filter which CarBrands to update
     */
    where?: CarBrandWhereInput
    /**
     * Limit how many CarBrands to update.
     */
    limit?: number
  }

  /**
   * CarBrand updateManyAndReturn
   */
  export type CarBrandUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarBrand
     */
    select?: CarBrandSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CarBrand
     */
    omit?: CarBrandOmit<ExtArgs> | null
    /**
     * The data used to update CarBrands.
     */
    data: XOR<CarBrandUpdateManyMutationInput, CarBrandUncheckedUpdateManyInput>
    /**
     * Filter which CarBrands to update
     */
    where?: CarBrandWhereInput
    /**
     * Limit how many CarBrands to update.
     */
    limit?: number
  }

  /**
   * CarBrand upsert
   */
  export type CarBrandUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarBrand
     */
    select?: CarBrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarBrand
     */
    omit?: CarBrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarBrandInclude<ExtArgs> | null
    /**
     * The filter to search for the CarBrand to update in case it exists.
     */
    where: CarBrandWhereUniqueInput
    /**
     * In case the CarBrand found by the `where` argument doesn't exist, create a new CarBrand with this data.
     */
    create: XOR<CarBrandCreateInput, CarBrandUncheckedCreateInput>
    /**
     * In case the CarBrand was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CarBrandUpdateInput, CarBrandUncheckedUpdateInput>
  }

  /**
   * CarBrand delete
   */
  export type CarBrandDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarBrand
     */
    select?: CarBrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarBrand
     */
    omit?: CarBrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarBrandInclude<ExtArgs> | null
    /**
     * Filter which CarBrand to delete.
     */
    where: CarBrandWhereUniqueInput
  }

  /**
   * CarBrand deleteMany
   */
  export type CarBrandDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CarBrands to delete
     */
    where?: CarBrandWhereInput
    /**
     * Limit how many CarBrands to delete.
     */
    limit?: number
  }

  /**
   * CarBrand.carModels
   */
  export type CarBrand$carModelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarModel
     */
    select?: CarModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarModel
     */
    omit?: CarModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarModelInclude<ExtArgs> | null
    where?: CarModelWhereInput
    orderBy?: CarModelOrderByWithRelationInput | CarModelOrderByWithRelationInput[]
    cursor?: CarModelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CarModelScalarFieldEnum | CarModelScalarFieldEnum[]
  }

  /**
   * CarBrand without action
   */
  export type CarBrandDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarBrand
     */
    select?: CarBrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarBrand
     */
    omit?: CarBrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarBrandInclude<ExtArgs> | null
  }


  /**
   * Model CarModel
   */

  export type AggregateCarModel = {
    _count: CarModelCountAggregateOutputType | null
    _avg: CarModelAvgAggregateOutputType | null
    _sum: CarModelSumAggregateOutputType | null
    _min: CarModelMinAggregateOutputType | null
    _max: CarModelMaxAggregateOutputType | null
  }

  export type CarModelAvgAggregateOutputType = {
    id: number | null
    yearFrom: number | null
    yearTo: number | null
    carBrandId: number | null
  }

  export type CarModelSumAggregateOutputType = {
    id: number | null
    yearFrom: number | null
    yearTo: number | null
    carBrandId: number | null
  }

  export type CarModelMinAggregateOutputType = {
    id: number | null
    name: string | null
    displayName: string | null
    yearFrom: number | null
    yearTo: number | null
    generation: string | null
    bodyType: string | null
    engineType: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    carBrandId: number | null
  }

  export type CarModelMaxAggregateOutputType = {
    id: number | null
    name: string | null
    displayName: string | null
    yearFrom: number | null
    yearTo: number | null
    generation: string | null
    bodyType: string | null
    engineType: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    carBrandId: number | null
  }

  export type CarModelCountAggregateOutputType = {
    id: number
    name: number
    displayName: number
    yearFrom: number
    yearTo: number
    generation: number
    bodyType: number
    engineType: number
    isActive: number
    createdAt: number
    updatedAt: number
    carBrandId: number
    _all: number
  }


  export type CarModelAvgAggregateInputType = {
    id?: true
    yearFrom?: true
    yearTo?: true
    carBrandId?: true
  }

  export type CarModelSumAggregateInputType = {
    id?: true
    yearFrom?: true
    yearTo?: true
    carBrandId?: true
  }

  export type CarModelMinAggregateInputType = {
    id?: true
    name?: true
    displayName?: true
    yearFrom?: true
    yearTo?: true
    generation?: true
    bodyType?: true
    engineType?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    carBrandId?: true
  }

  export type CarModelMaxAggregateInputType = {
    id?: true
    name?: true
    displayName?: true
    yearFrom?: true
    yearTo?: true
    generation?: true
    bodyType?: true
    engineType?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    carBrandId?: true
  }

  export type CarModelCountAggregateInputType = {
    id?: true
    name?: true
    displayName?: true
    yearFrom?: true
    yearTo?: true
    generation?: true
    bodyType?: true
    engineType?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    carBrandId?: true
    _all?: true
  }

  export type CarModelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CarModel to aggregate.
     */
    where?: CarModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CarModels to fetch.
     */
    orderBy?: CarModelOrderByWithRelationInput | CarModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CarModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CarModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CarModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CarModels
    **/
    _count?: true | CarModelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CarModelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CarModelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CarModelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CarModelMaxAggregateInputType
  }

  export type GetCarModelAggregateType<T extends CarModelAggregateArgs> = {
        [P in keyof T & keyof AggregateCarModel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCarModel[P]>
      : GetScalarType<T[P], AggregateCarModel[P]>
  }




  export type CarModelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CarModelWhereInput
    orderBy?: CarModelOrderByWithAggregationInput | CarModelOrderByWithAggregationInput[]
    by: CarModelScalarFieldEnum[] | CarModelScalarFieldEnum
    having?: CarModelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CarModelCountAggregateInputType | true
    _avg?: CarModelAvgAggregateInputType
    _sum?: CarModelSumAggregateInputType
    _min?: CarModelMinAggregateInputType
    _max?: CarModelMaxAggregateInputType
  }

  export type CarModelGroupByOutputType = {
    id: number
    name: string
    displayName: string | null
    yearFrom: number | null
    yearTo: number | null
    generation: string | null
    bodyType: string | null
    engineType: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    carBrandId: number
    _count: CarModelCountAggregateOutputType | null
    _avg: CarModelAvgAggregateOutputType | null
    _sum: CarModelSumAggregateOutputType | null
    _min: CarModelMinAggregateOutputType | null
    _max: CarModelMaxAggregateOutputType | null
  }

  type GetCarModelGroupByPayload<T extends CarModelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CarModelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CarModelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CarModelGroupByOutputType[P]>
            : GetScalarType<T[P], CarModelGroupByOutputType[P]>
        }
      >
    >


  export type CarModelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    displayName?: boolean
    yearFrom?: boolean
    yearTo?: boolean
    generation?: boolean
    bodyType?: boolean
    engineType?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    carBrandId?: boolean
    carBrand?: boolean | CarBrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["carModel"]>

  export type CarModelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    displayName?: boolean
    yearFrom?: boolean
    yearTo?: boolean
    generation?: boolean
    bodyType?: boolean
    engineType?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    carBrandId?: boolean
    carBrand?: boolean | CarBrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["carModel"]>

  export type CarModelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    displayName?: boolean
    yearFrom?: boolean
    yearTo?: boolean
    generation?: boolean
    bodyType?: boolean
    engineType?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    carBrandId?: boolean
    carBrand?: boolean | CarBrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["carModel"]>

  export type CarModelSelectScalar = {
    id?: boolean
    name?: boolean
    displayName?: boolean
    yearFrom?: boolean
    yearTo?: boolean
    generation?: boolean
    bodyType?: boolean
    engineType?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    carBrandId?: boolean
  }

  export type CarModelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "displayName" | "yearFrom" | "yearTo" | "generation" | "bodyType" | "engineType" | "isActive" | "createdAt" | "updatedAt" | "carBrandId", ExtArgs["result"]["carModel"]>
  export type CarModelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carBrand?: boolean | CarBrandDefaultArgs<ExtArgs>
  }
  export type CarModelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carBrand?: boolean | CarBrandDefaultArgs<ExtArgs>
  }
  export type CarModelIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carBrand?: boolean | CarBrandDefaultArgs<ExtArgs>
  }

  export type $CarModelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CarModel"
    objects: {
      carBrand: Prisma.$CarBrandPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      displayName: string | null
      yearFrom: number | null
      yearTo: number | null
      generation: string | null
      bodyType: string | null
      engineType: string | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
      carBrandId: number
    }, ExtArgs["result"]["carModel"]>
    composites: {}
  }

  type CarModelGetPayload<S extends boolean | null | undefined | CarModelDefaultArgs> = $Result.GetResult<Prisma.$CarModelPayload, S>

  type CarModelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CarModelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CarModelCountAggregateInputType | true
    }

  export interface CarModelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CarModel'], meta: { name: 'CarModel' } }
    /**
     * Find zero or one CarModel that matches the filter.
     * @param {CarModelFindUniqueArgs} args - Arguments to find a CarModel
     * @example
     * // Get one CarModel
     * const carModel = await prisma.carModel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CarModelFindUniqueArgs>(args: SelectSubset<T, CarModelFindUniqueArgs<ExtArgs>>): Prisma__CarModelClient<$Result.GetResult<Prisma.$CarModelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CarModel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CarModelFindUniqueOrThrowArgs} args - Arguments to find a CarModel
     * @example
     * // Get one CarModel
     * const carModel = await prisma.carModel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CarModelFindUniqueOrThrowArgs>(args: SelectSubset<T, CarModelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CarModelClient<$Result.GetResult<Prisma.$CarModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CarModel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CarModelFindFirstArgs} args - Arguments to find a CarModel
     * @example
     * // Get one CarModel
     * const carModel = await prisma.carModel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CarModelFindFirstArgs>(args?: SelectSubset<T, CarModelFindFirstArgs<ExtArgs>>): Prisma__CarModelClient<$Result.GetResult<Prisma.$CarModelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CarModel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CarModelFindFirstOrThrowArgs} args - Arguments to find a CarModel
     * @example
     * // Get one CarModel
     * const carModel = await prisma.carModel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CarModelFindFirstOrThrowArgs>(args?: SelectSubset<T, CarModelFindFirstOrThrowArgs<ExtArgs>>): Prisma__CarModelClient<$Result.GetResult<Prisma.$CarModelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CarModels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CarModelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CarModels
     * const carModels = await prisma.carModel.findMany()
     * 
     * // Get first 10 CarModels
     * const carModels = await prisma.carModel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const carModelWithIdOnly = await prisma.carModel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CarModelFindManyArgs>(args?: SelectSubset<T, CarModelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CarModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CarModel.
     * @param {CarModelCreateArgs} args - Arguments to create a CarModel.
     * @example
     * // Create one CarModel
     * const CarModel = await prisma.carModel.create({
     *   data: {
     *     // ... data to create a CarModel
     *   }
     * })
     * 
     */
    create<T extends CarModelCreateArgs>(args: SelectSubset<T, CarModelCreateArgs<ExtArgs>>): Prisma__CarModelClient<$Result.GetResult<Prisma.$CarModelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CarModels.
     * @param {CarModelCreateManyArgs} args - Arguments to create many CarModels.
     * @example
     * // Create many CarModels
     * const carModel = await prisma.carModel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CarModelCreateManyArgs>(args?: SelectSubset<T, CarModelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CarModels and returns the data saved in the database.
     * @param {CarModelCreateManyAndReturnArgs} args - Arguments to create many CarModels.
     * @example
     * // Create many CarModels
     * const carModel = await prisma.carModel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CarModels and only return the `id`
     * const carModelWithIdOnly = await prisma.carModel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CarModelCreateManyAndReturnArgs>(args?: SelectSubset<T, CarModelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CarModelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CarModel.
     * @param {CarModelDeleteArgs} args - Arguments to delete one CarModel.
     * @example
     * // Delete one CarModel
     * const CarModel = await prisma.carModel.delete({
     *   where: {
     *     // ... filter to delete one CarModel
     *   }
     * })
     * 
     */
    delete<T extends CarModelDeleteArgs>(args: SelectSubset<T, CarModelDeleteArgs<ExtArgs>>): Prisma__CarModelClient<$Result.GetResult<Prisma.$CarModelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CarModel.
     * @param {CarModelUpdateArgs} args - Arguments to update one CarModel.
     * @example
     * // Update one CarModel
     * const carModel = await prisma.carModel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CarModelUpdateArgs>(args: SelectSubset<T, CarModelUpdateArgs<ExtArgs>>): Prisma__CarModelClient<$Result.GetResult<Prisma.$CarModelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CarModels.
     * @param {CarModelDeleteManyArgs} args - Arguments to filter CarModels to delete.
     * @example
     * // Delete a few CarModels
     * const { count } = await prisma.carModel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CarModelDeleteManyArgs>(args?: SelectSubset<T, CarModelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CarModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CarModelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CarModels
     * const carModel = await prisma.carModel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CarModelUpdateManyArgs>(args: SelectSubset<T, CarModelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CarModels and returns the data updated in the database.
     * @param {CarModelUpdateManyAndReturnArgs} args - Arguments to update many CarModels.
     * @example
     * // Update many CarModels
     * const carModel = await prisma.carModel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CarModels and only return the `id`
     * const carModelWithIdOnly = await prisma.carModel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CarModelUpdateManyAndReturnArgs>(args: SelectSubset<T, CarModelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CarModelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CarModel.
     * @param {CarModelUpsertArgs} args - Arguments to update or create a CarModel.
     * @example
     * // Update or create a CarModel
     * const carModel = await prisma.carModel.upsert({
     *   create: {
     *     // ... data to create a CarModel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CarModel we want to update
     *   }
     * })
     */
    upsert<T extends CarModelUpsertArgs>(args: SelectSubset<T, CarModelUpsertArgs<ExtArgs>>): Prisma__CarModelClient<$Result.GetResult<Prisma.$CarModelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CarModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CarModelCountArgs} args - Arguments to filter CarModels to count.
     * @example
     * // Count the number of CarModels
     * const count = await prisma.carModel.count({
     *   where: {
     *     // ... the filter for the CarModels we want to count
     *   }
     * })
    **/
    count<T extends CarModelCountArgs>(
      args?: Subset<T, CarModelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CarModelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CarModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CarModelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CarModelAggregateArgs>(args: Subset<T, CarModelAggregateArgs>): Prisma.PrismaPromise<GetCarModelAggregateType<T>>

    /**
     * Group by CarModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CarModelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CarModelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CarModelGroupByArgs['orderBy'] }
        : { orderBy?: CarModelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CarModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCarModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CarModel model
   */
  readonly fields: CarModelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CarModel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CarModelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    carBrand<T extends CarBrandDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CarBrandDefaultArgs<ExtArgs>>): Prisma__CarBrandClient<$Result.GetResult<Prisma.$CarBrandPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CarModel model
   */
  interface CarModelFieldRefs {
    readonly id: FieldRef<"CarModel", 'Int'>
    readonly name: FieldRef<"CarModel", 'String'>
    readonly displayName: FieldRef<"CarModel", 'String'>
    readonly yearFrom: FieldRef<"CarModel", 'Int'>
    readonly yearTo: FieldRef<"CarModel", 'Int'>
    readonly generation: FieldRef<"CarModel", 'String'>
    readonly bodyType: FieldRef<"CarModel", 'String'>
    readonly engineType: FieldRef<"CarModel", 'String'>
    readonly isActive: FieldRef<"CarModel", 'Boolean'>
    readonly createdAt: FieldRef<"CarModel", 'DateTime'>
    readonly updatedAt: FieldRef<"CarModel", 'DateTime'>
    readonly carBrandId: FieldRef<"CarModel", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * CarModel findUnique
   */
  export type CarModelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarModel
     */
    select?: CarModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarModel
     */
    omit?: CarModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarModelInclude<ExtArgs> | null
    /**
     * Filter, which CarModel to fetch.
     */
    where: CarModelWhereUniqueInput
  }

  /**
   * CarModel findUniqueOrThrow
   */
  export type CarModelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarModel
     */
    select?: CarModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarModel
     */
    omit?: CarModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarModelInclude<ExtArgs> | null
    /**
     * Filter, which CarModel to fetch.
     */
    where: CarModelWhereUniqueInput
  }

  /**
   * CarModel findFirst
   */
  export type CarModelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarModel
     */
    select?: CarModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarModel
     */
    omit?: CarModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarModelInclude<ExtArgs> | null
    /**
     * Filter, which CarModel to fetch.
     */
    where?: CarModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CarModels to fetch.
     */
    orderBy?: CarModelOrderByWithRelationInput | CarModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CarModels.
     */
    cursor?: CarModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CarModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CarModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CarModels.
     */
    distinct?: CarModelScalarFieldEnum | CarModelScalarFieldEnum[]
  }

  /**
   * CarModel findFirstOrThrow
   */
  export type CarModelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarModel
     */
    select?: CarModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarModel
     */
    omit?: CarModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarModelInclude<ExtArgs> | null
    /**
     * Filter, which CarModel to fetch.
     */
    where?: CarModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CarModels to fetch.
     */
    orderBy?: CarModelOrderByWithRelationInput | CarModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CarModels.
     */
    cursor?: CarModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CarModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CarModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CarModels.
     */
    distinct?: CarModelScalarFieldEnum | CarModelScalarFieldEnum[]
  }

  /**
   * CarModel findMany
   */
  export type CarModelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarModel
     */
    select?: CarModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarModel
     */
    omit?: CarModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarModelInclude<ExtArgs> | null
    /**
     * Filter, which CarModels to fetch.
     */
    where?: CarModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CarModels to fetch.
     */
    orderBy?: CarModelOrderByWithRelationInput | CarModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CarModels.
     */
    cursor?: CarModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CarModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CarModels.
     */
    skip?: number
    distinct?: CarModelScalarFieldEnum | CarModelScalarFieldEnum[]
  }

  /**
   * CarModel create
   */
  export type CarModelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarModel
     */
    select?: CarModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarModel
     */
    omit?: CarModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarModelInclude<ExtArgs> | null
    /**
     * The data needed to create a CarModel.
     */
    data: XOR<CarModelCreateInput, CarModelUncheckedCreateInput>
  }

  /**
   * CarModel createMany
   */
  export type CarModelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CarModels.
     */
    data: CarModelCreateManyInput | CarModelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CarModel createManyAndReturn
   */
  export type CarModelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarModel
     */
    select?: CarModelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CarModel
     */
    omit?: CarModelOmit<ExtArgs> | null
    /**
     * The data used to create many CarModels.
     */
    data: CarModelCreateManyInput | CarModelCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarModelIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CarModel update
   */
  export type CarModelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarModel
     */
    select?: CarModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarModel
     */
    omit?: CarModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarModelInclude<ExtArgs> | null
    /**
     * The data needed to update a CarModel.
     */
    data: XOR<CarModelUpdateInput, CarModelUncheckedUpdateInput>
    /**
     * Choose, which CarModel to update.
     */
    where: CarModelWhereUniqueInput
  }

  /**
   * CarModel updateMany
   */
  export type CarModelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CarModels.
     */
    data: XOR<CarModelUpdateManyMutationInput, CarModelUncheckedUpdateManyInput>
    /**
     * Filter which CarModels to update
     */
    where?: CarModelWhereInput
    /**
     * Limit how many CarModels to update.
     */
    limit?: number
  }

  /**
   * CarModel updateManyAndReturn
   */
  export type CarModelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarModel
     */
    select?: CarModelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CarModel
     */
    omit?: CarModelOmit<ExtArgs> | null
    /**
     * The data used to update CarModels.
     */
    data: XOR<CarModelUpdateManyMutationInput, CarModelUncheckedUpdateManyInput>
    /**
     * Filter which CarModels to update
     */
    where?: CarModelWhereInput
    /**
     * Limit how many CarModels to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarModelIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CarModel upsert
   */
  export type CarModelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarModel
     */
    select?: CarModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarModel
     */
    omit?: CarModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarModelInclude<ExtArgs> | null
    /**
     * The filter to search for the CarModel to update in case it exists.
     */
    where: CarModelWhereUniqueInput
    /**
     * In case the CarModel found by the `where` argument doesn't exist, create a new CarModel with this data.
     */
    create: XOR<CarModelCreateInput, CarModelUncheckedCreateInput>
    /**
     * In case the CarModel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CarModelUpdateInput, CarModelUncheckedUpdateInput>
  }

  /**
   * CarModel delete
   */
  export type CarModelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarModel
     */
    select?: CarModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarModel
     */
    omit?: CarModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarModelInclude<ExtArgs> | null
    /**
     * Filter which CarModel to delete.
     */
    where: CarModelWhereUniqueInput
  }

  /**
   * CarModel deleteMany
   */
  export type CarModelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CarModels to delete
     */
    where?: CarModelWhereInput
    /**
     * Limit how many CarModels to delete.
     */
    limit?: number
  }

  /**
   * CarModel without action
   */
  export type CarModelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarModel
     */
    select?: CarModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CarModel
     */
    omit?: CarModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CarModelInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const MatsScalarFieldEnum: {
    id: 'id',
    type: 'type',
    color: 'color',
    cellType: 'cellType',
    edgeColor: 'edgeColor',
    image: 'image'
  };

  export type MatsScalarFieldEnum = (typeof MatsScalarFieldEnum)[keyof typeof MatsScalarFieldEnum]


  export const CarBrandScalarFieldEnum: {
    id: 'id',
    name: 'name',
    displayName: 'displayName',
    logo: 'logo',
    description: 'description',
    website: 'website',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CarBrandScalarFieldEnum = (typeof CarBrandScalarFieldEnum)[keyof typeof CarBrandScalarFieldEnum]


  export const CarModelScalarFieldEnum: {
    id: 'id',
    name: 'name',
    displayName: 'displayName',
    yearFrom: 'yearFrom',
    yearTo: 'yearTo',
    generation: 'generation',
    bodyType: 'bodyType',
    engineType: 'engineType',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    carBrandId: 'carBrandId'
  };

  export type CarModelScalarFieldEnum = (typeof CarModelScalarFieldEnum)[keyof typeof CarModelScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type MatsWhereInput = {
    AND?: MatsWhereInput | MatsWhereInput[]
    OR?: MatsWhereInput[]
    NOT?: MatsWhereInput | MatsWhereInput[]
    id?: IntFilter<"Mats"> | number
    type?: StringFilter<"Mats"> | string
    color?: StringFilter<"Mats"> | string
    cellType?: StringFilter<"Mats"> | string
    edgeColor?: StringFilter<"Mats"> | string
    image?: StringFilter<"Mats"> | string
  }

  export type MatsOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    color?: SortOrder
    cellType?: SortOrder
    edgeColor?: SortOrder
    image?: SortOrder
  }

  export type MatsWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: MatsWhereInput | MatsWhereInput[]
    OR?: MatsWhereInput[]
    NOT?: MatsWhereInput | MatsWhereInput[]
    type?: StringFilter<"Mats"> | string
    color?: StringFilter<"Mats"> | string
    cellType?: StringFilter<"Mats"> | string
    edgeColor?: StringFilter<"Mats"> | string
    image?: StringFilter<"Mats"> | string
  }, "id">

  export type MatsOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    color?: SortOrder
    cellType?: SortOrder
    edgeColor?: SortOrder
    image?: SortOrder
    _count?: MatsCountOrderByAggregateInput
    _avg?: MatsAvgOrderByAggregateInput
    _max?: MatsMaxOrderByAggregateInput
    _min?: MatsMinOrderByAggregateInput
    _sum?: MatsSumOrderByAggregateInput
  }

  export type MatsScalarWhereWithAggregatesInput = {
    AND?: MatsScalarWhereWithAggregatesInput | MatsScalarWhereWithAggregatesInput[]
    OR?: MatsScalarWhereWithAggregatesInput[]
    NOT?: MatsScalarWhereWithAggregatesInput | MatsScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Mats"> | number
    type?: StringWithAggregatesFilter<"Mats"> | string
    color?: StringWithAggregatesFilter<"Mats"> | string
    cellType?: StringWithAggregatesFilter<"Mats"> | string
    edgeColor?: StringWithAggregatesFilter<"Mats"> | string
    image?: StringWithAggregatesFilter<"Mats"> | string
  }

  export type CarBrandWhereInput = {
    AND?: CarBrandWhereInput | CarBrandWhereInput[]
    OR?: CarBrandWhereInput[]
    NOT?: CarBrandWhereInput | CarBrandWhereInput[]
    id?: IntFilter<"CarBrand"> | number
    name?: StringFilter<"CarBrand"> | string
    displayName?: StringNullableFilter<"CarBrand"> | string | null
    logo?: StringNullableFilter<"CarBrand"> | string | null
    description?: StringNullableFilter<"CarBrand"> | string | null
    website?: StringNullableFilter<"CarBrand"> | string | null
    isActive?: BoolFilter<"CarBrand"> | boolean
    createdAt?: DateTimeFilter<"CarBrand"> | Date | string
    updatedAt?: DateTimeFilter<"CarBrand"> | Date | string
    carModels?: CarModelListRelationFilter
  }

  export type CarBrandOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    displayName?: SortOrderInput | SortOrder
    logo?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    carModels?: CarModelOrderByRelationAggregateInput
  }

  export type CarBrandWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: CarBrandWhereInput | CarBrandWhereInput[]
    OR?: CarBrandWhereInput[]
    NOT?: CarBrandWhereInput | CarBrandWhereInput[]
    displayName?: StringNullableFilter<"CarBrand"> | string | null
    logo?: StringNullableFilter<"CarBrand"> | string | null
    description?: StringNullableFilter<"CarBrand"> | string | null
    website?: StringNullableFilter<"CarBrand"> | string | null
    isActive?: BoolFilter<"CarBrand"> | boolean
    createdAt?: DateTimeFilter<"CarBrand"> | Date | string
    updatedAt?: DateTimeFilter<"CarBrand"> | Date | string
    carModels?: CarModelListRelationFilter
  }, "id" | "name">

  export type CarBrandOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    displayName?: SortOrderInput | SortOrder
    logo?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CarBrandCountOrderByAggregateInput
    _avg?: CarBrandAvgOrderByAggregateInput
    _max?: CarBrandMaxOrderByAggregateInput
    _min?: CarBrandMinOrderByAggregateInput
    _sum?: CarBrandSumOrderByAggregateInput
  }

  export type CarBrandScalarWhereWithAggregatesInput = {
    AND?: CarBrandScalarWhereWithAggregatesInput | CarBrandScalarWhereWithAggregatesInput[]
    OR?: CarBrandScalarWhereWithAggregatesInput[]
    NOT?: CarBrandScalarWhereWithAggregatesInput | CarBrandScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CarBrand"> | number
    name?: StringWithAggregatesFilter<"CarBrand"> | string
    displayName?: StringNullableWithAggregatesFilter<"CarBrand"> | string | null
    logo?: StringNullableWithAggregatesFilter<"CarBrand"> | string | null
    description?: StringNullableWithAggregatesFilter<"CarBrand"> | string | null
    website?: StringNullableWithAggregatesFilter<"CarBrand"> | string | null
    isActive?: BoolWithAggregatesFilter<"CarBrand"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"CarBrand"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CarBrand"> | Date | string
  }

  export type CarModelWhereInput = {
    AND?: CarModelWhereInput | CarModelWhereInput[]
    OR?: CarModelWhereInput[]
    NOT?: CarModelWhereInput | CarModelWhereInput[]
    id?: IntFilter<"CarModel"> | number
    name?: StringFilter<"CarModel"> | string
    displayName?: StringNullableFilter<"CarModel"> | string | null
    yearFrom?: IntNullableFilter<"CarModel"> | number | null
    yearTo?: IntNullableFilter<"CarModel"> | number | null
    generation?: StringNullableFilter<"CarModel"> | string | null
    bodyType?: StringNullableFilter<"CarModel"> | string | null
    engineType?: StringNullableFilter<"CarModel"> | string | null
    isActive?: BoolFilter<"CarModel"> | boolean
    createdAt?: DateTimeFilter<"CarModel"> | Date | string
    updatedAt?: DateTimeFilter<"CarModel"> | Date | string
    carBrandId?: IntFilter<"CarModel"> | number
    carBrand?: XOR<CarBrandScalarRelationFilter, CarBrandWhereInput>
  }

  export type CarModelOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    displayName?: SortOrderInput | SortOrder
    yearFrom?: SortOrderInput | SortOrder
    yearTo?: SortOrderInput | SortOrder
    generation?: SortOrderInput | SortOrder
    bodyType?: SortOrderInput | SortOrder
    engineType?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    carBrandId?: SortOrder
    carBrand?: CarBrandOrderByWithRelationInput
  }

  export type CarModelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name_carBrandId_yearFrom?: CarModelNameCarBrandIdYearFromCompoundUniqueInput
    AND?: CarModelWhereInput | CarModelWhereInput[]
    OR?: CarModelWhereInput[]
    NOT?: CarModelWhereInput | CarModelWhereInput[]
    name?: StringFilter<"CarModel"> | string
    displayName?: StringNullableFilter<"CarModel"> | string | null
    yearFrom?: IntNullableFilter<"CarModel"> | number | null
    yearTo?: IntNullableFilter<"CarModel"> | number | null
    generation?: StringNullableFilter<"CarModel"> | string | null
    bodyType?: StringNullableFilter<"CarModel"> | string | null
    engineType?: StringNullableFilter<"CarModel"> | string | null
    isActive?: BoolFilter<"CarModel"> | boolean
    createdAt?: DateTimeFilter<"CarModel"> | Date | string
    updatedAt?: DateTimeFilter<"CarModel"> | Date | string
    carBrandId?: IntFilter<"CarModel"> | number
    carBrand?: XOR<CarBrandScalarRelationFilter, CarBrandWhereInput>
  }, "id" | "name_carBrandId_yearFrom">

  export type CarModelOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    displayName?: SortOrderInput | SortOrder
    yearFrom?: SortOrderInput | SortOrder
    yearTo?: SortOrderInput | SortOrder
    generation?: SortOrderInput | SortOrder
    bodyType?: SortOrderInput | SortOrder
    engineType?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    carBrandId?: SortOrder
    _count?: CarModelCountOrderByAggregateInput
    _avg?: CarModelAvgOrderByAggregateInput
    _max?: CarModelMaxOrderByAggregateInput
    _min?: CarModelMinOrderByAggregateInput
    _sum?: CarModelSumOrderByAggregateInput
  }

  export type CarModelScalarWhereWithAggregatesInput = {
    AND?: CarModelScalarWhereWithAggregatesInput | CarModelScalarWhereWithAggregatesInput[]
    OR?: CarModelScalarWhereWithAggregatesInput[]
    NOT?: CarModelScalarWhereWithAggregatesInput | CarModelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CarModel"> | number
    name?: StringWithAggregatesFilter<"CarModel"> | string
    displayName?: StringNullableWithAggregatesFilter<"CarModel"> | string | null
    yearFrom?: IntNullableWithAggregatesFilter<"CarModel"> | number | null
    yearTo?: IntNullableWithAggregatesFilter<"CarModel"> | number | null
    generation?: StringNullableWithAggregatesFilter<"CarModel"> | string | null
    bodyType?: StringNullableWithAggregatesFilter<"CarModel"> | string | null
    engineType?: StringNullableWithAggregatesFilter<"CarModel"> | string | null
    isActive?: BoolWithAggregatesFilter<"CarModel"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"CarModel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CarModel"> | Date | string
    carBrandId?: IntWithAggregatesFilter<"CarModel"> | number
  }

  export type MatsCreateInput = {
    type: string
    color: string
    cellType: string
    edgeColor: string
    image: string
  }

  export type MatsUncheckedCreateInput = {
    id?: number
    type: string
    color: string
    cellType: string
    edgeColor: string
    image: string
  }

  export type MatsUpdateInput = {
    type?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    cellType?: StringFieldUpdateOperationsInput | string
    edgeColor?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
  }

  export type MatsUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    cellType?: StringFieldUpdateOperationsInput | string
    edgeColor?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
  }

  export type MatsCreateManyInput = {
    id?: number
    type: string
    color: string
    cellType: string
    edgeColor: string
    image: string
  }

  export type MatsUpdateManyMutationInput = {
    type?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    cellType?: StringFieldUpdateOperationsInput | string
    edgeColor?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
  }

  export type MatsUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    cellType?: StringFieldUpdateOperationsInput | string
    edgeColor?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
  }

  export type CarBrandCreateInput = {
    name: string
    displayName?: string | null
    logo?: string | null
    description?: string | null
    website?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    carModels?: CarModelCreateNestedManyWithoutCarBrandInput
  }

  export type CarBrandUncheckedCreateInput = {
    id?: number
    name: string
    displayName?: string | null
    logo?: string | null
    description?: string | null
    website?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    carModels?: CarModelUncheckedCreateNestedManyWithoutCarBrandInput
  }

  export type CarBrandUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    carModels?: CarModelUpdateManyWithoutCarBrandNestedInput
  }

  export type CarBrandUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    carModels?: CarModelUncheckedUpdateManyWithoutCarBrandNestedInput
  }

  export type CarBrandCreateManyInput = {
    id?: number
    name: string
    displayName?: string | null
    logo?: string | null
    description?: string | null
    website?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CarBrandUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CarBrandUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CarModelCreateInput = {
    name: string
    displayName?: string | null
    yearFrom?: number | null
    yearTo?: number | null
    generation?: string | null
    bodyType?: string | null
    engineType?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    carBrand: CarBrandCreateNestedOneWithoutCarModelsInput
  }

  export type CarModelUncheckedCreateInput = {
    id?: number
    name: string
    displayName?: string | null
    yearFrom?: number | null
    yearTo?: number | null
    generation?: string | null
    bodyType?: string | null
    engineType?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    carBrandId: number
  }

  export type CarModelUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    yearFrom?: NullableIntFieldUpdateOperationsInput | number | null
    yearTo?: NullableIntFieldUpdateOperationsInput | number | null
    generation?: NullableStringFieldUpdateOperationsInput | string | null
    bodyType?: NullableStringFieldUpdateOperationsInput | string | null
    engineType?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    carBrand?: CarBrandUpdateOneRequiredWithoutCarModelsNestedInput
  }

  export type CarModelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    yearFrom?: NullableIntFieldUpdateOperationsInput | number | null
    yearTo?: NullableIntFieldUpdateOperationsInput | number | null
    generation?: NullableStringFieldUpdateOperationsInput | string | null
    bodyType?: NullableStringFieldUpdateOperationsInput | string | null
    engineType?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    carBrandId?: IntFieldUpdateOperationsInput | number
  }

  export type CarModelCreateManyInput = {
    id?: number
    name: string
    displayName?: string | null
    yearFrom?: number | null
    yearTo?: number | null
    generation?: string | null
    bodyType?: string | null
    engineType?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    carBrandId: number
  }

  export type CarModelUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    yearFrom?: NullableIntFieldUpdateOperationsInput | number | null
    yearTo?: NullableIntFieldUpdateOperationsInput | number | null
    generation?: NullableStringFieldUpdateOperationsInput | string | null
    bodyType?: NullableStringFieldUpdateOperationsInput | string | null
    engineType?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CarModelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    yearFrom?: NullableIntFieldUpdateOperationsInput | number | null
    yearTo?: NullableIntFieldUpdateOperationsInput | number | null
    generation?: NullableStringFieldUpdateOperationsInput | string | null
    bodyType?: NullableStringFieldUpdateOperationsInput | string | null
    engineType?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    carBrandId?: IntFieldUpdateOperationsInput | number
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type MatsCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    color?: SortOrder
    cellType?: SortOrder
    edgeColor?: SortOrder
    image?: SortOrder
  }

  export type MatsAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type MatsMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    color?: SortOrder
    cellType?: SortOrder
    edgeColor?: SortOrder
    image?: SortOrder
  }

  export type MatsMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    color?: SortOrder
    cellType?: SortOrder
    edgeColor?: SortOrder
    image?: SortOrder
  }

  export type MatsSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CarModelListRelationFilter = {
    every?: CarModelWhereInput
    some?: CarModelWhereInput
    none?: CarModelWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CarModelOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CarBrandCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    displayName?: SortOrder
    logo?: SortOrder
    description?: SortOrder
    website?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CarBrandAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type CarBrandMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    displayName?: SortOrder
    logo?: SortOrder
    description?: SortOrder
    website?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CarBrandMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    displayName?: SortOrder
    logo?: SortOrder
    description?: SortOrder
    website?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CarBrandSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type CarBrandScalarRelationFilter = {
    is?: CarBrandWhereInput
    isNot?: CarBrandWhereInput
  }

  export type CarModelNameCarBrandIdYearFromCompoundUniqueInput = {
    name: string
    carBrandId: number
    yearFrom: number
  }

  export type CarModelCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    displayName?: SortOrder
    yearFrom?: SortOrder
    yearTo?: SortOrder
    generation?: SortOrder
    bodyType?: SortOrder
    engineType?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    carBrandId?: SortOrder
  }

  export type CarModelAvgOrderByAggregateInput = {
    id?: SortOrder
    yearFrom?: SortOrder
    yearTo?: SortOrder
    carBrandId?: SortOrder
  }

  export type CarModelMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    displayName?: SortOrder
    yearFrom?: SortOrder
    yearTo?: SortOrder
    generation?: SortOrder
    bodyType?: SortOrder
    engineType?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    carBrandId?: SortOrder
  }

  export type CarModelMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    displayName?: SortOrder
    yearFrom?: SortOrder
    yearTo?: SortOrder
    generation?: SortOrder
    bodyType?: SortOrder
    engineType?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    carBrandId?: SortOrder
  }

  export type CarModelSumOrderByAggregateInput = {
    id?: SortOrder
    yearFrom?: SortOrder
    yearTo?: SortOrder
    carBrandId?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CarModelCreateNestedManyWithoutCarBrandInput = {
    create?: XOR<CarModelCreateWithoutCarBrandInput, CarModelUncheckedCreateWithoutCarBrandInput> | CarModelCreateWithoutCarBrandInput[] | CarModelUncheckedCreateWithoutCarBrandInput[]
    connectOrCreate?: CarModelCreateOrConnectWithoutCarBrandInput | CarModelCreateOrConnectWithoutCarBrandInput[]
    createMany?: CarModelCreateManyCarBrandInputEnvelope
    connect?: CarModelWhereUniqueInput | CarModelWhereUniqueInput[]
  }

  export type CarModelUncheckedCreateNestedManyWithoutCarBrandInput = {
    create?: XOR<CarModelCreateWithoutCarBrandInput, CarModelUncheckedCreateWithoutCarBrandInput> | CarModelCreateWithoutCarBrandInput[] | CarModelUncheckedCreateWithoutCarBrandInput[]
    connectOrCreate?: CarModelCreateOrConnectWithoutCarBrandInput | CarModelCreateOrConnectWithoutCarBrandInput[]
    createMany?: CarModelCreateManyCarBrandInputEnvelope
    connect?: CarModelWhereUniqueInput | CarModelWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CarModelUpdateManyWithoutCarBrandNestedInput = {
    create?: XOR<CarModelCreateWithoutCarBrandInput, CarModelUncheckedCreateWithoutCarBrandInput> | CarModelCreateWithoutCarBrandInput[] | CarModelUncheckedCreateWithoutCarBrandInput[]
    connectOrCreate?: CarModelCreateOrConnectWithoutCarBrandInput | CarModelCreateOrConnectWithoutCarBrandInput[]
    upsert?: CarModelUpsertWithWhereUniqueWithoutCarBrandInput | CarModelUpsertWithWhereUniqueWithoutCarBrandInput[]
    createMany?: CarModelCreateManyCarBrandInputEnvelope
    set?: CarModelWhereUniqueInput | CarModelWhereUniqueInput[]
    disconnect?: CarModelWhereUniqueInput | CarModelWhereUniqueInput[]
    delete?: CarModelWhereUniqueInput | CarModelWhereUniqueInput[]
    connect?: CarModelWhereUniqueInput | CarModelWhereUniqueInput[]
    update?: CarModelUpdateWithWhereUniqueWithoutCarBrandInput | CarModelUpdateWithWhereUniqueWithoutCarBrandInput[]
    updateMany?: CarModelUpdateManyWithWhereWithoutCarBrandInput | CarModelUpdateManyWithWhereWithoutCarBrandInput[]
    deleteMany?: CarModelScalarWhereInput | CarModelScalarWhereInput[]
  }

  export type CarModelUncheckedUpdateManyWithoutCarBrandNestedInput = {
    create?: XOR<CarModelCreateWithoutCarBrandInput, CarModelUncheckedCreateWithoutCarBrandInput> | CarModelCreateWithoutCarBrandInput[] | CarModelUncheckedCreateWithoutCarBrandInput[]
    connectOrCreate?: CarModelCreateOrConnectWithoutCarBrandInput | CarModelCreateOrConnectWithoutCarBrandInput[]
    upsert?: CarModelUpsertWithWhereUniqueWithoutCarBrandInput | CarModelUpsertWithWhereUniqueWithoutCarBrandInput[]
    createMany?: CarModelCreateManyCarBrandInputEnvelope
    set?: CarModelWhereUniqueInput | CarModelWhereUniqueInput[]
    disconnect?: CarModelWhereUniqueInput | CarModelWhereUniqueInput[]
    delete?: CarModelWhereUniqueInput | CarModelWhereUniqueInput[]
    connect?: CarModelWhereUniqueInput | CarModelWhereUniqueInput[]
    update?: CarModelUpdateWithWhereUniqueWithoutCarBrandInput | CarModelUpdateWithWhereUniqueWithoutCarBrandInput[]
    updateMany?: CarModelUpdateManyWithWhereWithoutCarBrandInput | CarModelUpdateManyWithWhereWithoutCarBrandInput[]
    deleteMany?: CarModelScalarWhereInput | CarModelScalarWhereInput[]
  }

  export type CarBrandCreateNestedOneWithoutCarModelsInput = {
    create?: XOR<CarBrandCreateWithoutCarModelsInput, CarBrandUncheckedCreateWithoutCarModelsInput>
    connectOrCreate?: CarBrandCreateOrConnectWithoutCarModelsInput
    connect?: CarBrandWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CarBrandUpdateOneRequiredWithoutCarModelsNestedInput = {
    create?: XOR<CarBrandCreateWithoutCarModelsInput, CarBrandUncheckedCreateWithoutCarModelsInput>
    connectOrCreate?: CarBrandCreateOrConnectWithoutCarModelsInput
    upsert?: CarBrandUpsertWithoutCarModelsInput
    connect?: CarBrandWhereUniqueInput
    update?: XOR<XOR<CarBrandUpdateToOneWithWhereWithoutCarModelsInput, CarBrandUpdateWithoutCarModelsInput>, CarBrandUncheckedUpdateWithoutCarModelsInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type CarModelCreateWithoutCarBrandInput = {
    name: string
    displayName?: string | null
    yearFrom?: number | null
    yearTo?: number | null
    generation?: string | null
    bodyType?: string | null
    engineType?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CarModelUncheckedCreateWithoutCarBrandInput = {
    id?: number
    name: string
    displayName?: string | null
    yearFrom?: number | null
    yearTo?: number | null
    generation?: string | null
    bodyType?: string | null
    engineType?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CarModelCreateOrConnectWithoutCarBrandInput = {
    where: CarModelWhereUniqueInput
    create: XOR<CarModelCreateWithoutCarBrandInput, CarModelUncheckedCreateWithoutCarBrandInput>
  }

  export type CarModelCreateManyCarBrandInputEnvelope = {
    data: CarModelCreateManyCarBrandInput | CarModelCreateManyCarBrandInput[]
    skipDuplicates?: boolean
  }

  export type CarModelUpsertWithWhereUniqueWithoutCarBrandInput = {
    where: CarModelWhereUniqueInput
    update: XOR<CarModelUpdateWithoutCarBrandInput, CarModelUncheckedUpdateWithoutCarBrandInput>
    create: XOR<CarModelCreateWithoutCarBrandInput, CarModelUncheckedCreateWithoutCarBrandInput>
  }

  export type CarModelUpdateWithWhereUniqueWithoutCarBrandInput = {
    where: CarModelWhereUniqueInput
    data: XOR<CarModelUpdateWithoutCarBrandInput, CarModelUncheckedUpdateWithoutCarBrandInput>
  }

  export type CarModelUpdateManyWithWhereWithoutCarBrandInput = {
    where: CarModelScalarWhereInput
    data: XOR<CarModelUpdateManyMutationInput, CarModelUncheckedUpdateManyWithoutCarBrandInput>
  }

  export type CarModelScalarWhereInput = {
    AND?: CarModelScalarWhereInput | CarModelScalarWhereInput[]
    OR?: CarModelScalarWhereInput[]
    NOT?: CarModelScalarWhereInput | CarModelScalarWhereInput[]
    id?: IntFilter<"CarModel"> | number
    name?: StringFilter<"CarModel"> | string
    displayName?: StringNullableFilter<"CarModel"> | string | null
    yearFrom?: IntNullableFilter<"CarModel"> | number | null
    yearTo?: IntNullableFilter<"CarModel"> | number | null
    generation?: StringNullableFilter<"CarModel"> | string | null
    bodyType?: StringNullableFilter<"CarModel"> | string | null
    engineType?: StringNullableFilter<"CarModel"> | string | null
    isActive?: BoolFilter<"CarModel"> | boolean
    createdAt?: DateTimeFilter<"CarModel"> | Date | string
    updatedAt?: DateTimeFilter<"CarModel"> | Date | string
    carBrandId?: IntFilter<"CarModel"> | number
  }

  export type CarBrandCreateWithoutCarModelsInput = {
    name: string
    displayName?: string | null
    logo?: string | null
    description?: string | null
    website?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CarBrandUncheckedCreateWithoutCarModelsInput = {
    id?: number
    name: string
    displayName?: string | null
    logo?: string | null
    description?: string | null
    website?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CarBrandCreateOrConnectWithoutCarModelsInput = {
    where: CarBrandWhereUniqueInput
    create: XOR<CarBrandCreateWithoutCarModelsInput, CarBrandUncheckedCreateWithoutCarModelsInput>
  }

  export type CarBrandUpsertWithoutCarModelsInput = {
    update: XOR<CarBrandUpdateWithoutCarModelsInput, CarBrandUncheckedUpdateWithoutCarModelsInput>
    create: XOR<CarBrandCreateWithoutCarModelsInput, CarBrandUncheckedCreateWithoutCarModelsInput>
    where?: CarBrandWhereInput
  }

  export type CarBrandUpdateToOneWithWhereWithoutCarModelsInput = {
    where?: CarBrandWhereInput
    data: XOR<CarBrandUpdateWithoutCarModelsInput, CarBrandUncheckedUpdateWithoutCarModelsInput>
  }

  export type CarBrandUpdateWithoutCarModelsInput = {
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CarBrandUncheckedUpdateWithoutCarModelsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CarModelCreateManyCarBrandInput = {
    id?: number
    name: string
    displayName?: string | null
    yearFrom?: number | null
    yearTo?: number | null
    generation?: string | null
    bodyType?: string | null
    engineType?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CarModelUpdateWithoutCarBrandInput = {
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    yearFrom?: NullableIntFieldUpdateOperationsInput | number | null
    yearTo?: NullableIntFieldUpdateOperationsInput | number | null
    generation?: NullableStringFieldUpdateOperationsInput | string | null
    bodyType?: NullableStringFieldUpdateOperationsInput | string | null
    engineType?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CarModelUncheckedUpdateWithoutCarBrandInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    yearFrom?: NullableIntFieldUpdateOperationsInput | number | null
    yearTo?: NullableIntFieldUpdateOperationsInput | number | null
    generation?: NullableStringFieldUpdateOperationsInput | string | null
    bodyType?: NullableStringFieldUpdateOperationsInput | string | null
    engineType?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CarModelUncheckedUpdateManyWithoutCarBrandInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    yearFrom?: NullableIntFieldUpdateOperationsInput | number | null
    yearTo?: NullableIntFieldUpdateOperationsInput | number | null
    generation?: NullableStringFieldUpdateOperationsInput | string | null
    bodyType?: NullableStringFieldUpdateOperationsInput | string | null
    engineType?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}