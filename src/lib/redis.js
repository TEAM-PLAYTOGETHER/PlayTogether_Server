const redis = require('redis');

const redisClient = redis.createClient(process.env.REDIS_PORT);

async function redisRun() {
  await redisClient.connect();
}

redisRun();

module.exports = redisClient;
