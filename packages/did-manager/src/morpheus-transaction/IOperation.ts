/**
 * Most of the time we have a heterogenous collection of
 * operations. The visitor pattern allows us to implement many
 * algorithms that work on the limited set of operation types.
 */
export interface IOperationVisitor<T> {
  registerBeforeProof(contentId: string): T;
  revokeBeforeProof(contentId: string): T;
}

/**
 * Interface of all operation model classes.
 */
export abstract class IOperation {
  public static readonly type: string;

  public get type() { return (this as any).__proto__.constructor.type; }
  public abstract accept<T>(visitor: IOperationVisitor<T>): T;
}
