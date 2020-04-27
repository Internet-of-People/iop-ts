import { AxiosInstance, AxiosResponse } from 'axios';

export class HttpError extends Error {
  public constructor(public statusCode: number, public statusText: string, public resp: AxiosResponse) {
    super(`Http ${statusCode}. ${statusText}`);
  }
}

const noExceptionSetting = {
  validateStatus: (_: number): boolean => {
    return true;
  },
};

const throwIfFailed = (resp: AxiosResponse): AxiosResponse => {
  if (resp.status >= 200 && resp.status < 300) {
    return resp;
  } else if (resp.status === 429) {
    throw new HttpError(
      resp.status,
      'Too many requests were sent to the Hydra Network, rate limit exceeded. Wait 1 minute for further requests.',
      resp,
    );
  } else {
    throw new HttpError(
      resp.status,
      resp.statusText,
      resp,
    );
  }
};

export const apiGet = async(api: AxiosInstance, endpoint: string): Promise<AxiosResponse> => {
  return throwIfFailed(await api.get(endpoint, noExceptionSetting));
};

export const apiPost = async(api: AxiosInstance, endpoint: string, data: unknown): Promise<AxiosResponse> => {
  return throwIfFailed(await api.post(endpoint, data, noExceptionSetting));
};
