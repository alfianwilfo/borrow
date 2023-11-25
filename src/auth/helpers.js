const bcrypt = require("bcrypt");
const saltRounds = 10;
exports.getId = () => {
  return Math.floor(Date.now() * Math.random());
};

exports.hashPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(saltRounds));
};
