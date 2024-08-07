/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IncomingMessage, ServerResponse } from 'http';
import { SSOOptions } from '@/types';

export const login = jest.fn((req: IncomingMessage, res: ServerResponse, options?: SSOOptions) => {
  res.end('Login');
});

export const loginCallback = jest.fn(
  (req: IncomingMessage, res: ServerResponse, options?: SSOOptions) => {
    res.end('Login Callback');
  },
);

export const logout = jest.fn((req: IncomingMessage, res: ServerResponse, options?: SSOOptions) => {
  res.end('Logout');
});

export const logoutCallback = jest.fn(
  (req: IncomingMessage, res: ServerResponse, options?: SSOOptions) => {
    res.end('Logout Callback');
  },
);

export const token = jest.fn((req: IncomingMessage, res: ServerResponse, options?: SSOOptions) => {
  res.end('Token');
});
