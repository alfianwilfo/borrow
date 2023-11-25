const db = require("./db");

async function table_user() {
  const sql_user = `CREATE TABLE IF NOT EXISTS user
      (
        id BIGINT NOT NULL AUTO_INCREMENT,
        email varchar(50),
        password varchar(250),
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE (email)
      )`;

  const [rows, fields] = await db.query(sql_user);
  console.log(rows, "???");
}

table_user();
