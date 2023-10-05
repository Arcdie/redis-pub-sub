import * as fs from 'fs';
import * as WebSocketClient from 'ws';
import { createClient } from 'redis';

const config = {
  host: '127.0.0.1',
  port: 6379,
};

const redisClient = createClient({
  url: `redis://${config.host}:${config.port}`,
});

redisClient
  .on('connect', () => {
    console.log('Connection to Redis is successful');
    run();
  })
  .on('error', (err) => console.log(err))
  .connect();

const run = async () => {
  const limit = 10;
  const connectStrFutures = `wss://fstream.binance.com/stream?streams=`;

  let connectStr = connectStrFutures;
  const instrumentNames: string[] = JSON.parse(fs.readFileSync('./instruments_futures.json', 'utf-8'));

  instrumentNames.slice(0, limit).forEach(name => {
    connectStr += `${name.toLowerCase()}@depth@500ms/`;
  });

  const client = new WebSocketClient(connectStr.substring(0, connectStr.length - 1));

  client.on('open', () => {
    console.log('Connection is opened');
  });

  client.on('ping', () => client.pong());

  client.on('close', async message => {
    console.log('Connection is closed', message);
  });

  client.on('message', async bufferData => {
    const parsedData = JSON.parse(bufferData.toString());

    const instrumentName = parsedData.data.s;

    const validData = {
      asks: parsedData.data.a,
      bids: parsedData.data.b,
      instrumentName,
    };

    const key = `${instrumentName}:limit_orders`;
    await redisClient.publish(key, JSON.stringify(validData));
  });
};
