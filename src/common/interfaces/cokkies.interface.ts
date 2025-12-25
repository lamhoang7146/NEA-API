import { Request } from 'express';

export interface RequestWithCookies extends Request {
  cookies: {
    ACCESS_TOKEN?: string;
  };
}
