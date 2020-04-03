import { Layer2, Types } from '@internet-of-people/sdk';
type Right = Types.Sdk.Right;

/* eslint @typescript-eslint/no-extraneous-class: 0 */
export class RightRegistry {
  private static readonly systemRightsInstance = new Layer2.SystemRights();
  private static readonly rights: Right[] = [
    ...RightRegistry.systemRightsInstance.all,
  ];

  public static registerRight(right: Right): void {
    if (RightRegistry.isRightRegistered(right)) {
      throw new Error(`Right ${right} is already registered`);
    }

    RightRegistry.rights.push(right);
  }

  public static isRightRegistered(right: Right): boolean {
    return RightRegistry.rights.includes(right);
  }

  public static get systemRights(): Layer2.SystemRights {
    return RightRegistry.systemRightsInstance;
  }
}
