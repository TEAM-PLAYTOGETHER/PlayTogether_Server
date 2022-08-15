const app = require('./app');
const config = require('./config');
require('./socket');

const PORT = config.port;
const server = app
  .listen(PORT, () => {
    console.log(
      `
    
    ##############################################
    🛡️  Server listening on port: ${PORT} 🛡️
    ⚡️ Updated: 22.08.15              ⚡️
    ##############################################
  `,
    );
  })
  .on('error', (err) => {
    console.error(err);
    process.exit(1);
  });

server.timeout = 1000000;
