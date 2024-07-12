import * as express from 'express'
import cors from 'cors'
import ProductRepo from './database/repositories/products-repository';
import CartRepo from './database/repositories/carts-repository';
import productRequest from './models/product-request';
import product from './database/models/product';
import user from './database/models/user';
import userRequest from './models/user-request';
import Utils from './utils';
import addProductToCartRequest from './models/add-product-to-cart-request';
import searchRequest from './models/search-request';
class Router {

    constructor(server: express.Express) {
        const router = express.Router()

        router.get('/', (req: express.Request, res: express.Response) => {
            res.json({
                message: `Nothing to see here, [url]/swagger instead.`
            })
        })

        //get all products
        router.get('/products', cors(), async (req: express.Request, res: express.Response) => {
            try{
                await ProductRepo.getAllProducts().then(x =>
                {
                    res.json(x.hits.hits.map(h => {return {
                        id: h._id,
                        name: h._source.name,
                        description: h._source.description,
                        SKU: h._source.SKU,
                        category: {
                            description: h._source.category.description,
                            code: h._source.category.code
                        },
                        price: h._source.price
                    } as product}));
                })
            } catch (e) {
                res.status(400).send(JSON.stringify({ "error": "products not found" }));
            }
        })

        router.post('/products/search', cors(), async (req: searchRequest, res: express.Response) => {
            try{
                await ProductRepo.searchProducts(req.body.text).then(x =>
                    {
                    res.json(x.hits.hits.map(h => {return {
                        id: h._id,
                        name: h._source.name,
                        description: h._source.description,
                        SKU: h._source.SKU,
                        category: {
                            description: h._source.category.description,
                            code: h._source.category.code
                        },
                        price: h._source.price
                    } as product}));
                })
            } catch (e) {
                res.status(400).send(JSON.stringify({ "error": "products not found" }));
            }
        })

        router.get('/product/:id', async (req: express.Request, res: express.Response) => {
            try {
                await ProductRepo.getProduct(req.params.id).then(x =>
                    {
                        res.json( {
                                id: x._id,
                                name: x._source.name,
                                description: x._source.desciption,
                                SKU: x._source.SKU,
                                category: {
                                    description: x._source.category.description,
                                    code: x._source.category.code
                                },
                                price: x._source.price
                            } as product
                        )
                    });
            } catch (e) {
                res.status(400).send(JSON.stringify({ "error": "product not found" }));
            }
        })

        router.post('/product', async (req: productRequest, res: express.Response) => {
            try {
                await ProductRepo.addUpdateProduct(req.body);
                res.json({
                    res: 'product updated successfully'
                })
            } catch (e) {
                res.status(400).send(JSON.stringify({ "error": "problem with posted data" }));
            }
        })

        router.put('/product', async (req: productRequest, res: express.Response) => {
            try {
                await ProductRepo.addUpdateProduct(req.body);
                res.json({
                    res: 'product added successfully'
                })
            } catch (e) {
                res.status(400).send(JSON.stringify({ "error": "problem with posted data" }));
            }
        })

        router.delete('/product/:id', async (req: express.Request, res: express.Response) => {
            try {
                await ProductRepo.deleteProduct(req.params.id);
                res.json({
                    res: 'product deleted successfully'
                })
            } catch (e) {
                res.status(400).send(JSON.stringify({ "error": "product not found" }));
            }
        })


        router.get('/users', cors(), async (req: express.Request, res: express.Response) => {
            try{
                await CartRepo.getAllUsers().then(x =>
                    {
                    res.json(x.hits.hits.map(h => {return {
                        id: h._id,
                        userName: h._source.userName,
                        address: h._source.address,
                        email: h._source.email,
                        phone: h._source.phone
                    } as user}));
                }) 
            } catch (e) {
                res.status(400).send(JSON.stringify({ "error": "problem in getting data" }));
            }
        })

        router.post('/user', async (req: userRequest, res: express.Response) => {
            try {
                await CartRepo.addUser(req.body);
                res.json({
                    res: 'user added successfully'
                })
            } catch (e) {
                res.status(400).send(JSON.stringify({ "error": "problem with posted data" }));
            }
        })

        router.get('/cart/:id', async (req: express.Request, res: express.Response) => {
            try {
                await CartRepo.getUserCart(req.params.id).then(x =>
                    {
                        res.json(  {
                            id: x._id,
                            userName: x._source.userName,
                            address: x._source.address,
                            email: x._source.email,
                            phone: x._source.phone,
                            cart: x._source.cart ? Utils.groupBy(x._source.cart, 'code') : {}
                          } as user
                        )
                    });
            } catch (e) {
                res.status(400).send(JSON.stringify({ "error": "cart not found" }));
            }
        })

        router.put('/cart', async (req: addProductToCartRequest, res: express.Response) => {
            try {
                await CartRepo.addProductToCart(req.body);

                res.json({
                    res: 'product added to cart successfully'
                })
            } catch (e) {
                res.status(400).send(JSON.stringify({ "error": "problem with posted data" }));
            }
        })

        router.put('/cart/update-amount', async (req: addProductToCartRequest, res: express.Response) => {
            try {
                await CartRepo.updateProductAmmountInCart(req.body);

                res.json({
                    res: 'the amount updated successfully'
                })
            } catch (e) {
                res.status(400).send(JSON.stringify({ "error": "problem with posted data" }));
            }
        })

        router.get('/user/most-love', async (req: express.Request, res: express.Response) => {
            try{ 
                await CartRepo.getUserMostLove().then(x =>
                 {
                    x.aggregations.cart.code.buckets.forEach(x => {})
                     res.json(x.aggregations.cart.code.buckets);
                 }) 
            } catch (e) {
                res.status(400).send(JSON.stringify({ "error": "problem in getting results" }));
            }   
         })

        router.options('*', cors());

        server.use('/', router)
    }
}

export default Router;