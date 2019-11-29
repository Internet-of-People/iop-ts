import { IOperation, IOperationVisitor, OperationType } from './IOperation';

export class RegisterBeforeProof extends IOperation {
  public static readonly type = OperationType.RegisterBeforeProof;

  public constructor(public readonly contentId: string) {
    super();
  }

  public accept<T>(visitor: IOperationVisitor<T>): T {
    return visitor.registerBeforeProof(this.contentId);
  }
}

export const registerBeforeProofSchema = {
  type: 'object',
  required: ['operation', 'params'],
  additionalProperties: false,
  properties: {
    operation: {
      type: 'string',
      const: OperationType.RegisterBeforeProof
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
