import { float } from "@elastic/elasticsearch/lib/api/types";
import category from "./category";

type product = {
    id: string;
    name: string;
    description: string;
    SKU: string;
    category: category;
    price: float;
}
export default product

