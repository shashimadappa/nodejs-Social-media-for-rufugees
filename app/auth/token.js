const { sign, verify } = require("jsonwebtoken");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
// const tokenMsg = require('../msgCodes/token-msg');
const tokenConfig = require("../config/default.json");
const jwt = require("jsonwebtoken");

const secretKey = "1234567890"; // Replace with your actual secret key

// Middleware to validate JWT token
const validateToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.id = decoded.id;
    req.email = decoded.email;
    next();
  });
};

const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    // uniqueID: user.uniqueId
  };
  console.log(payload)
  const twoHoursInSeconds = 200 * 60 * 60; //two hours
  const options = {
    expiresIn: twoHoursInSeconds, // Token expiration time set to one week
  };
  // Generate the token
  const token = jwt.sign(payload, secretKey, options);

  return token;
};

module.exports = { validateToken, generateToken };
