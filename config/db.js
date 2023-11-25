const mysql = require("mysql2");

const connection = mysql
  .createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "lib",
    rowsAsArray: true,
  })
  .promise();

module.exports = connection;
