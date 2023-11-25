const db = require("./db");

async function table_user() {
  const sql_user = `CREATE TABLE IF NOT EXISTS user
      (
        id BIGINT NOT NULL,
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
        id BIGINT NOT NULL,
        name varchar(250),
        count BIGINT NOT NULL,
        created_at TIMESTAMP,
        updated_at TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE (name)
      )`;
  await db.query(sql_book);
}

async function table_borrow() {
  const sql_borrow = `CREATE TABLE IF NOT EXISTS borrow
      (
        id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        book_id BIGINT NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES user(id),
        foreign key (book_id) references book(id)
      )`;
  await db.query(sql_borrow);
}

table_user();
table_book();
table_borrow();
