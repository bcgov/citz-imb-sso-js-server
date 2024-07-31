/* eslint-disable no-unused-vars */
import { SSOIdentityProvider, SSOUser } from '@bcgov/citz-imb-sso-js-core';

export type SSOOptions = {
  afterUserLogin?: <TProvider extends SSOIdentityProvider>(
    user: SSOUser<TProvider>,
  ) => Promise<void> | void;
  afterUserLogout?: <TProvider extends SSOIdentityProvider>(
    user: SSOUser<TProvider>,
  ) => Promise<void> | void;
};
