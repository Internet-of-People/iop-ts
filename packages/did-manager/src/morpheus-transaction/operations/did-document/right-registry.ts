import { Right } from '../../../interfaces';

/* eslint max-classes-per-file: 0 */
export class SystemRights {
  public get all(): string[] {
    return [ 'update', 'impersonate' ];
  }

  public get update(): string {
    return 'update';
  }

  public get impersonate(): string {
    return 'impersonate';
  }
}

/* eslint @typescript-eslint/no-extraneous-class: 0 */
export class RightRegistry {
  private static readonly systemRightsInstance = new SystemRights();
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

  public static get systemRights(): SystemRights {
    return RightRegistry.systemRightsInstance;
  }
}
