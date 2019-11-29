import { IOperation, IOperationVisitor, OperationType } from './IOperation';

export class RevokeBeforeProof extends IOperation {
  public static readonly type = OperationType.RevokeBeforeProof;

  public constructor(public readonly contentId: string) {
    super();
  }

  public accept<T>(visitor: IOperationVisitor<T>): T {
    return visitor.revokeBeforeProof(this.contentId);
  }
}

export const revokeBeforeProofSchema = {
  type: 'object',
  required: ['operation', 'params'],
  additionalProperties: false,
  properties: {
    operation: {
      type: 'string',
      const: OperationType.RevokeBeforeProof
    },
    params: {
      type: 'object',
      required: ['contentId'],
      additionalProperties: false,
      properties: {
        contentId: {
          type: 'string'
        }
      }
    }
  }
};
