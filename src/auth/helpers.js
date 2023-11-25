const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
exports.getId = () => {
  return Math.floor(Date.now() * Math.random());
};

exports.hashPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(saltRounds));
};

exports.comparePassword = (password, hashed) => {
  return bcrypt.compareSync(password, hashed);
};

exports.generateToken = (id) => {
  return { token: jwt.sign({ id }, "shhhhh, its a secret") };
};
