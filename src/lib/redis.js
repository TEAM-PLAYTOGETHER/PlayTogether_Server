const redis = require('redis');

const redisClient = redis.createClient(process.env.REDIS_PORT);

async function redisRun() {
  await redisClient.connect();
}

redisClient.on('connect', () => {
  console.log('[🔥Redis] redis connected');
});

redisRun();

module.exports = redisClient;
