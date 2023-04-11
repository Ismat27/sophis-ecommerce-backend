const { createToken, decodeToken, addTokenToCookie } = require("./Jwt");
const userToken = require("./createUserToken");
const grantUserPermission = require("./grantPermissions");

module.exports = {
  createToken,
  decodeToken,
  userToken,
  addTokenToCookie,
  grantUserPermission,
};
