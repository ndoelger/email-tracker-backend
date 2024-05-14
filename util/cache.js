// THIS IS THE CACHE WE'LL USE TO STORE TOKEN INFORMATION DURING THE SESSION
const NodeCache = require("node-cache");
const tokenCache = new NodeCache({ deleteOnExpire: true });

module.exports = tokenCache;
