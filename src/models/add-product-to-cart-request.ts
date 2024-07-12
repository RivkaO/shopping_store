import { float } from '@elastic/elasticsearch/lib/api/types';
import { Request } from 'express';
import category from "../database/models/category";

export default interface addProductToCartRequest extends Request {
    userId: string;
    productId: string;
    amount: number;
  }

