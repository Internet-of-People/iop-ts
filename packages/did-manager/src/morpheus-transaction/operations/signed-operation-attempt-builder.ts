import {Authentication, Did, IOperationData} from '../../interfaces';
import { RegisterBeforeProof, RevokeBeforeProof } from './before-proof';
import {AddKey} from './did-document';
import { Operation } from './operation';
import { toData } from './to-data';
import {OperationAttemptsBuilder} from './operation-attempts-builder'
import { PersistentVault } from "@internet-of-people/keyvault";

export class SignedOperationAttemptBuilder {
  public constructor(private readonly builder: OperationAttemptsBuilder,
                     private readonly operation: Operation,
                     private readonly vault: PersistentVault) {
  }

  public sign(): OperationAttemptsBuilder {
    let operationData = toData(this.operation);
    let opBinary
    sign operation;
    add it to builder;
    return builder;
  }
}