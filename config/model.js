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

  await db.query(sql_user);
}

async function table_book() {
  const sql_book = `CREATE TABLE IF NOT EXISTS book
      (
        id BIGINT NOT NULL AUTO_INCREMENT,
        name varchar(250),
        count BIGINT NOT NULL,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE (name)
      )`;
  await db.query(sql_book);
}

table_user();
table_book();
