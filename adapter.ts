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

subscriberClient
  .on('connect', () => {
    console.log('Connection to Redis is successful');
    run();
  })
  .on('error', (err) => console.log(err))
  .connect();

const run = async () => {
  await subscriberClient.pSubscribe('*:limit_orders', async (msg) => {
    const parsedMsg: {
      instrumentName: string; asks: any[]; bids: any[];
    } = JSON.parse(msg);

    const key = `${parsedMsg.instrumentName}:limit_orders`;
    const common: { [key: string]: string } = Object.fromEntries([...parsedMsg.asks, ...parsedMsg.bids]);

    await redisClient.hSet(
      key,
      [...Object.entries(common)],
    );
  });
};
