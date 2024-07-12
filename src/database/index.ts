import config from '../config';

const { Client } = require('@elastic/elasticsearch')
const elasticConfig = config.elastic;

const client = new Client({
  cloud: {
    id: elasticConfig.cloudID
  },
  auth: {
    username: elasticConfig.username,
    password: elasticConfig.password
  }
})

export const elasticClient = client;
