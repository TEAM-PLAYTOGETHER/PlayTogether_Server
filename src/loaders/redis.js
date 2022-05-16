const redis = require('redis');
const client = redis.createClient();

client.on('connect', () => {
  console.log('[🔥Redis] redis connected');
});

module.exports = client;
