import { IOperation, IOperationVisitor } from './IOperation';

export class RevokeBeforeProof extends IOperation {
  public static readonly type = 'revokeBeforeProof';

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
      const: RevokeBeforeProof.type
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
