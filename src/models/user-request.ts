import { Request } from 'express';

export default interface userRequest extends Request {
    id: string;
    userName: string;
    address: string;
    email: string;
    phone: string;
  }

