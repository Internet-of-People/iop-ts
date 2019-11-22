import * as Operations from './operations';

export class DidManager {
  public static hello(): void {
    console.log("HELLO!");
  }

  public static getHello(): string {
    return "HELLO!";
  }
}

export {
  Operations,
}