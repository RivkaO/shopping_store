import { float } from '@elastic/elasticsearch/lib/api/types';
import { Request } from 'express';
import category from "../database/models/category";

export default interface productRequest extends Request {
    name: string;
    description: string;
    SKU: string;
    category: category;
    price: float;
    id: string;
  }

