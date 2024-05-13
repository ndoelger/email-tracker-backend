const NodeCache = require("node-cache");
const tokenCache = new NodeCache({ deleteOnExpire: true });

module.exports = tokenCache;
