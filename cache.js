const NodeCache = require("node-cache");
const tokenCache = new NodeCache({ deleteOnExpire: true });
const refreshToken = {};

module.exports = tokenCache;
