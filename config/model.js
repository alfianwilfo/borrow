const db = require("./db")

const sql_user = `CREATE TABLE IF NOT EXISTS user
    (
      id BIGINT NOT NULL AUTO_INCREMENT,
      email varchar(50),
      password varchar(50),
      created_at TIMESTAMP,
      updated_at TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE (email)
    )`
    
db.query(sql_user, function (err, result) {
  if (err) throw err;
  console.log("Table created");
});
    