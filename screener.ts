import { createClient } from 'redis';

const config = {
  host: '127.0.0.1',
  port: 6379,
};

const subscriberClient = createClient({
  url: `redis://${config.host}:${config.port}`,
});

const redisClient = subscriberClient.duplicate();
redisClient.connect();

let limitOrders = [];

subscriberClient
  .on('connect', () => {
    console.log('Connection to Redis is successful');


  })
  .on('error', (err) => console.log(err))
  .connect();

const getLimitOrders = async () => {

};

const run = async () => {
  await subscriberClient.pSubscribe('*:limit_orders', async (msg) => {
    const parsedMsg: {
      instrumentName: string; asks: any[]; bids: any[];
    } = JSON.parse(msg);

    const common: { [key: string]: string } = Object.fromEntries([...parsedMsg.asks, ...parsedMsg.bids]);

    // .. doing screener logic ...;

    setInterval(() => {
      
    }, 10000);

    // const key = `${parsedMsg.instrumentName}:limit_orders`;
  });
};
