import { Right } from '../types/sdk';

/* eslint max-classes-per-file: 0 */
export class SystemRights {
  public get all(): Right[] {
    return [ 'update', 'impersonate' ];
  }

  public get update(): Right {
    return 'update';
  }

  public get impersonate(): Right {
    return 'impersonate';
  }
}
