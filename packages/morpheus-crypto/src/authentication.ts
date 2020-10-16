import { Authentication, AuthenticationData, DidData } from './types';
import { Did, KeyId, PublicKey } from '@internet-of-people/sdk-wasm';

export const didToAuth = (did: DidData): Authentication => {
  return new Did(did).defaultKeyId();
};

export const isSameAuthentication = (left: Authentication, right: Authentication): boolean => {
  // NOTE ugly implementation of double dispatch for both params
  if (left instanceof PublicKey) {
    if (right instanceof KeyId) {
      return left.validateId(right);
    } else {
      return left.toString() === right.toString();
    }
  } else {
    if (right instanceof KeyId) {
      return left.toString() === right.toString();
    } else {
      return right.validateId(left);
    }
  }
};

/** NOTE throws if conversion failed */
export const authenticationFromData = (data: AuthenticationData): Authentication => {
  if (data.startsWith(KeyId.prefix())) {
    return new KeyId(data);
  } else {
    return new PublicKey(data);
  }
};
