import cart from "./cart";

type user = {
    id: string;
    userName: string;
    address: string;
    email: string;
    phone: string;
    cart: cart[];
}
export default user

