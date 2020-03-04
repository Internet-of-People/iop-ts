import { HashType, hashAsBuffer } from 'bigint-hash';
import multibase from 'multibase';
import { canonicalJson } from './canonicalJson';
import { ContentId, IContent } from '../interfaces/io';

export const defaultDigest = (json: string): string => {
  const hash = hashAsBuffer(HashType.SHA3_256, Buffer.from(json, 'utf8'));
  return `cj${ multibase.encode('base64url', hash)}`;
};

/**
 * Calculates the ContentId of any content representible as a JSON object.
 * The calculation collapses complex structures by recursively replacing
 * leaf object values with their ContentId. When it finds a cycle among the
 * objects, it throws an exception.
 *
 * @param content Any object, but not an array or a string
 */
export const digest = <T extends IContent>(content: T): ContentId => {
  return JSON.parse(canonicalJson(content, defaultDigest));
};
