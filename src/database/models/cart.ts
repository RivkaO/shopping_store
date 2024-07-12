import { float } from "@elastic/elasticsearch/lib/api/types";

type cart = {
    code: string;
    description: string;
    price: float;
}
export default cart

