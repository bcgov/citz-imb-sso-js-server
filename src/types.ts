/* eslint-disable no-unused-vars */
import type { SSOIdentityProvider, SSOUser } from '@bcgov/citz-imb-sso-js-core';

export type SSOOptions = {
  afterUserLogin?: <TProvider extends SSOIdentityProvider | unknown>(
    user: SSOUser<TProvider>,
  ) => Promise<void> | void;
  afterUserLogout?: <TProvider extends SSOIdentityProvider | unknown>(
    user: SSOUser<TProvider>,
  ) => Promise<void> | void;
};

declare module 'http' {
  interface IncomingMessage {
    token?: string;
    user?: SSOUser<SSOIdentityProvider | unknown, object>;
  }
}
