import { elasticClient } from "..";
import addProductToCartRequest from "../../models/add-product-to-cart-request";
import user from "../models/user";
import ProductRepo from './products-repository';

async function createIndex(): Promise<any> {
    elasticClient.indices.create({
        index: "carts",
        body: {
            "settings": {
                "analysis": {
                  "analyzer": {
                    "case_insensitive_analyzer": {
                      "type": "custom",
                      "filter": [
                        "lowercase"
                      ],
                      "tokenizer": "keyword"
                    }
                  }
                }
              },
            "mappings": {
                    "properties": {
                        "userName": {
                            "type": "text",
                            "fields": {
                              "insensitive": {
                                "type": "text",
                                "analyzer": "case_insensitive_analyzer"
                              },
                              "keyword": {
                                "type": "keyword",
                                "ignore_above": 256
                              }
                            }
                          },
                          "email": {
                            "type": "text",
                            "fields": {
                              "insensitive": {
                                "type": "text",
                                "analyzer": "case_insensitive_analyzer"
                              },
                              "keyword": {
                                "type": "keyword",
                                "ignore_above": 256
                              }
                            }
                          },
                          "address": {
                            "type": "text",
                            "fields": {
                              "insensitive": {
                                "type": "text",
                                "analyzer": "case_insensitive_analyzer"
                              },
                              "keyword": {
                                "type": "keyword",
                                "ignore_above": 256
                              }
                            }
                          },
                          "phone": {
                            "type": "text",
                            "fields": {
                              "insensitive": {
                                "type": "text",
                                "analyzer": "case_insensitive_analyzer"
                              },
                              "keyword": {
                                "type": "keyword",
                                "ignore_above": 256
                              }
                            }
                          },
                          "cart": {
                            "type": "nested",
                            "properties": {
                              "code":{
                                "type": "text",
                                "fields": {
                                  "insensitive": {
                                    "type": "text",
                                    "analyzer": "case_insensitive_analyzer"
                                  },
                                  "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                  }
                                }
                            },
                                "desciption":{
                            "type": "text",
                            "fields": {
                              "insensitive": {
                                "type": "text",
                                "analyzer": "case_insensitive_analyzer"
                              },
                              "keyword": {
                                "type": "keyword",
                                "ignore_above": 256
                              }
                            }
                        },
                        "price": {
                          "type": "float"
                        }
                        }
                          }
                    }
            }
        }
    }, function (err, resp, respcode) {
        console.log(err, resp, respcode);
    });
  }

  async function getUserCart(id: string): Promise<any> {
    return await elasticClient.get({
        index: 'carts',
        id: id
      });
 }

 async function getAllUsers(): Promise<any> {
  return await elasticClient.search({
     index: 'carts',
     query: {
         "match_all": {}
     }
   })
 
}

  async function addUser(req: user): Promise<any> {
    await elasticClient.index({
        index: 'carts',
        id: req.id,
        document: {
            "userName": req.userName,
             "address": req.address,
             "email": req.email,
             "phone": req.phone
           }
      })
    
      await elasticClient.indices.refresh({ index: 'products' }, function (err, resp, respcode) {
    });
  }

  async function addProductToCart(req: addProductToCartRequest): Promise<any> {
    return await ProductRepo.getProduct(req.productId).then(async(product)=>{
      return await getUserCart(req.userId).then(async(x)=> {
        let doc =  {
          id: x._id,
          userName: x._source.userName,
          address: x._source.address,
          email: x._source.email,
          phone: x._source.phone,
          cart: x._source.cart ?? []
        };

        for (let i = 0; i < req.amount; i++) {
          doc.cart.push({code: product._id, description: product._source.name})
        }

        await elasticClient.index({
          index: 'carts',
          id: req.userId,
          document: doc
        })

        await elasticClient.indices.refresh({ index: 'carts' }, function (err, resp, respcode) {
        });
      });
    });
  }

  async function updateProductAmmountInCart(req: addProductToCartRequest): Promise<any> {
    return await getUserCart(req.userId).then(async(x)=> {
        let doc =  {
          id: x._id,
          userName: x._source.userName,
          address: x._source.address,
          email: x._source.email,
          phone: x._source.phone,
          cart: []
        };
        const existProducts = x._source.cart.filter(c => c.code == req.productId);
        const product = {code: existProducts[0].code, description: existProducts[0].description} as any;
        const prevAmount = existProducts.length;
        if(prevAmount == 0 || req.amount == prevAmount){
          doc.cart = x._source.cart;
          return;
        }
        x._source.cart.filter(c => c.code != req.productId)?.forEach(element => {
          doc.cart.push({code: element.code, description: element.description});
        });
        for (let i = 0; i < (req.amount); i++) {
          doc.cart.push({code: product.code, description: product.description});
        }

        await elasticClient.index({
          index: 'carts',
          id: req.userId,
          document: doc
        })

        await elasticClient.indices.refresh({ index: 'carts' }, function (err, resp, respcode) {
        });
    });
  }

  async function getUserMostLove(): Promise<any> {
    return await elasticClient.search({
       index: 'carts',
       aggs: {
        "cart": {
          "nested": {
            "path": "cart"
          },
          "aggs": {
           "code": {
          "terms": {
            "field": "cart.code.keyword",
            "size": 3
          }
        }
          }
        }
      }
     })
   
 }
  
  export default {
    getUserCart,
    getAllUsers,
    addUser,
    addProductToCart,
    updateProductAmmountInCart,
    getUserMostLove
  };