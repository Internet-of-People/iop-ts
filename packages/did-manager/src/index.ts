import { BeforeProofState, IBeforeProofOperations, IBeforeProofState } from "./before-proof";
import * as Transaction from "./morpheus-transaction";
import { TimeSeries } from "./time-series";

export class DidManager {
  public static hello(): void {
    console.log("HELLO!");
  }

  public static getHello(): string {
    return "HELLO!";
  }
}

export { IBeforeProofState, IBeforeProofOperations, BeforeProofState, Transaction, TimeSeries };