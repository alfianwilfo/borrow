const mysql = require('mysql2')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'lib'
});

const sql = "CREATE DATABASE IF NOT EXISTS lib";

connection.query(sql, (err, result) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Database created");
    }
})

connection.connect((e) => {
    if (e) {
        console.e('error connecting to MySQL database:', e);
    } else {
        console.log('Connected to MySQL database!');
    }
})


module.exports = connection