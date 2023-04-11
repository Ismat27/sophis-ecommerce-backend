const jsonwebtoken = require("jsonwebtoken");

const createToken = ({ payload }) => {
  return jsonwebtoken.sign(payload, process.env.SECRET, {
    expiresIn: process.env.EXPIRATION || '1d',
  });
};

//verify token created
const decodeToken = (token) => {
  return jsonwebtoken.verify(token, process.env.SECRET);
};

//add token tocookie
const addTokenToCookie = ({ res, user }) => {
  const token = createToken({ payload: user });
  const cookieExpiration = 1000 * 60 * 60 * 1; //24hrs for now
  res.cookie("token", token, {
    httpOnly: true,
    expire: Date.now() + cookieExpiration,
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

module.exports = { decodeToken, createToken, addTokenToCookie };
