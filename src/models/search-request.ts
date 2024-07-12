import { Request } from 'express';

export default interface searchRequest extends Request {
    text: string;
  }

