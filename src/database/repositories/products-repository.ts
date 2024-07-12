import { elasticClient } from "..";
import product from "../models/product";

 async function createIndex(): Promise<any> {
    elasticClient.indices.create({
        index: "products",
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
                        "name": {
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
                          "description": {
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
                          "SKU": {
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
                          "category": {
                            "properties": {
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
                        "code": {
                            "type": "integer"
                          },
                        }
                          },
                          "price": {
                            "type": "float"
                          }
                    }
            }
        }
    }, function (err, resp, respcode) {
        console.log(err, resp, respcode);
    });
  }

  async function getProduct(id: string): Promise<any> {
    return await elasticClient.get({
        index: 'products',
        id: id
      }); 
 }

  async function getAllProducts(): Promise<any> {
     return await elasticClient.search({
        index: 'products',
        query: {
            "match_all": {}
        }
      })
  }

  async function addUpdateProduct(req: product): Promise<any> {
    await elasticClient.index({
        index: 'products',
        id: req.id,
        document: {
            "name": req.name,
             "description": req.description,
             "SKU": req.SKU,
             "category": {
               "description": req.category?.description,
               "code": req.category?.code
             },
             "price": req.price
           }
      })
    
      await elasticClient.indices.refresh({ index: 'products' }, function (err, resp, respcode) {
    });
  }

  
  async function deleteProduct(id: string): Promise<any> {
    return await elasticClient.delete({
       index: 'products',
       id: id
     })
   
 }

 async function searchProducts(req: string): Promise<any> {
    const words = req.split(" ");
    let nameSearch = [];
    let descriptionSearch = [];
    words.forEach(x => {
        descriptionSearch.push({
            "bool": {
              "minimum_should_match": 1, 
              "should": [
                {
                  "wildcard": {
                    "description.insensitive": "*"+ x +"*"
                   }
                },
                {
                  "term": {
                    "description": x
                   }
                }
              ]
            }
          })
          nameSearch.push(
            {
                "wildcard": {
                  "name.insensitive": "*"+ x +"*"
                }
              },
              {
                 "term": {
                  "name": x
                }
              }
          )
    })

    return await elasticClient.search({
       index: 'products',
       query: { 
        "bool": { 
          "minimum_should_match": 1, 
          "should": [
             {
                "bool": { "should": 
                nameSearch
                }
              },
              {
                "bool": {
                  "must": 
                  descriptionSearch
 
                }
              },
              {
                "wildcard": {
                  "description.keyword": "*"+req+"*"
                }
              }
              


    ]
  }},
  "size": 10
     })
   
 }
  export default {
    getProduct,
    getAllProducts,
    addUpdateProduct,
    deleteProduct,
    searchProducts
  };