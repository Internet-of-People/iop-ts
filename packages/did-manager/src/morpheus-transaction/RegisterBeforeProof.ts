import { IOperation, IOperationVisitor } from './IOperation';

export class RegisterBeforeProof extends IOperation {
  public static readonly type = 'registerBeforeProof';

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
      const: RegisterBeforeProof.type
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
