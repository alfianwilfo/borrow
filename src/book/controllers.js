const Validator = require("validatorjs");
const DB = require("../../config/db");
const Helper = require("./helpers");
exports.list = async (req, res, next) => {
  let sql_list, sql_count, total;
  let { offset, limit, order, sort } = req.query;
  offset = parseInt(offset) ? parseInt(offset) : 0;
  limit = parseInt(limit) ? parseInt(limit) : 20;
  order = order ? order : "created_at";
  sort = sort ? sort : "desc";

  let rules = {
    offset: "required",
    limit: "required",
    order: "required",
    sort: "required",
  };

  let error_msg = {
    in: "invalid :attribute",
  };

  let validation = new Validator(
    { offset, limit, order, sort },
    rules,
    error_msg
  );
  validation.checkAsync(passes, fails);

  function fails() {
    let message = [];
    for (var key in validation.errors.all()) {
      var value = validation.errors.all()[key];
      message.push(value[0]);
    }
    return res.status(200).json({
      code: 401,
      status: "error",
      message: message,
      result: [],
    });
  }

  async function passes() {
    try {
      sql_list = `SELECT * FROM book ORDER BY ${order} ${sort} LIMIT ${limit} OFFSET ${
        offset * limit
      }`;
      sql_count = `SELECT COUNT(*) from book`;

      const [count, field_count] = await DB.query(sql_count);
      total = count[0]["COUNT(*)"];
      const [rows, fields] = await DB.query(sql_list);
      res.json({
        code: 200,
        status: "success",
        message: ["success get list."],
        total,
        offset,
        limit,
        result: [rows],
      });
    } catch (err) {
      err.message = err.message.includes("SQLState")
        ? "Query syntax error."
        : err.message;
      res.json({
        code: 400,
        status: "error",
        message: [err.message],
        result: [],
      });
    }
  }
};
exports.store = async (req, res, next) => {
  let sql_insert,
    id = Helper.getId();
  let { name, count } = req.body;
  let rules = {
    name: "required|check_book",
    count: "required|numeric",
  };

  let error_msg = {
    in: "invalid :attribute",
  };
  Validator.registerAsync(
    "check_book",
    async (name, attribute, req, passes) => {
      let sql_count = `SELECT COUNT(*) from book where name = '${name}'`;
      const [rows, fields] = await DB.query(sql_count);
      if (rows[0]["COUNT(*)"] == 0) {
        passes();
      } else {
        passes(false, "Book already in database.");
      }
    }
  );
  let validation = new Validator(req.body, rules, error_msg);
  validation.checkAsync(passes, fails);

  function fails() {
    let message = [];
    for (var key in validation.errors.all()) {
      var value = validation.errors.all()[key];
      message.push(value[0]);
    }
    return res.status(200).json({
      code: 401,
      status: "error",
      message: message,
      result: [],
    });
  }

  async function passes() {
    try {
      sql_insert = `INSERT INTO book (id, name, count, created_at, updated_at) VALUES ( '${id}', '${name}', '${count}' , CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())`;
      await DB.query(sql_insert);
      res.json({
        code: 201,
        status: "success",
        message: ["Book created."],
        result: [],
      });
    } catch (err) {
      err.message = err.message.includes("SQLState")
        ? "Query syntax error."
        : err.message.includes("Duplicate entry")
        ? "Book already in database."
        : err.message;
      res.json({
        code: 400,
        status: "error",
        message: [err.message],
        result: [],
      });
    }
  }
};

exports.borrow = async (req, res, next) => {
  let { user_id } = req.session;
  let sql_get,
    data,
    sql_decrement,
    sql_insert,
    id = Helper.getId(),
    sql_check;
  let { book_id } = req.body;
  let rules = {
    book_id: "required|numeric",
  };

  let error_msg = {
    in: "invalid :attribute",
  };
  let validation = new Validator(req.body, rules, error_msg);
  validation.checkAsync(passes, fails);

  function fails() {
    let message = [];
    for (var key in validation.errors.all()) {
      var value = validation.errors.all()[key];
      message.push(value[0]);
    }
    return res.status(200).json({
      code: 401,
      status: "error",
      message: message,
      result: [],
    });
  }

  async function passes() {
    try {
      sql_check = `SELECT * FROM borrow WHERE user_id = '${user_id}' LIMIT 1`;
      const [check] = await DB.query(sql_check);
      if (check.length) {
        res.json({
          code: 400,
          status: "error",
          message: ["You already borrowed a book."],
          result: [],
        });
      } else {
        await DB.query(`START TRANSACTION;`);
        sql_get = `SELECT * FROM book WHERE id = '${book_id}' LIMIT 1`;
        const [book] = await DB.query(sql_get);
        if (!book.length) {
          await DB.query(`ROLLBACK;`);
          res.json({
            code: 404,
            status: "error",
            message: ["Book not found."],
            result: [],
          });
        } else {
          data = book[0];
          if (!data.count) {
            await DB.query(`ROLLBACK;`);
            res.json({
              code: 400,
              status: "error",
              message: ["This book is not available."],
              result: [],
            });
          } else {
            sql_decrement = `UPDATE book SET count = GREATEST(0, count - 1), updated_at = CURRENT_TIMESTAMP()
              WHERE id = '${book_id}'`;
            await DB.query(sql_decrement);
            sql_insert = `INSERT INTO borrow (id, user_id, book_id) VALUES ( '${id}', '${user_id}', '${data.id}')`;
            await DB.query(sql_insert);
            await DB.query(`COMMIT;`);
            res.json({
              code: 201,
              status: "success",
              message: ["Book borrowed."],
              result: [],
            });
          }
        }
      }
    } catch (err) {
      await DB.query(`ROLLBACK;`);
      err.message = err.message.includes("SQLState")
        ? "Query syntax error."
        : err.message;
      res.json({
        code: 400,
        status: "error",
        message: [err.message],
        result: [],
      });
    }
  }
};

exports.return = async (req, res, next) => {
  let { user_id } = req.session;
  let { book_id } = req.body;
  let sql_delete, sql_increment;
  let rules = {
    book_id: "required|numeric|borrow_check",
  };

  let error_msg = {
    in: "invalid :attribute",
  };

  Validator.registerAsync(
    "borrow_check",
    async (book_id, attribute, req, passes) => {
      let sql_count = `SELECT COUNT(*) from borrow where book_id = '${book_id}' AND user_id = '${user_id}'`;
      const [rows] = await DB.query(sql_count);
      if (rows[0]["COUNT(*)"] == 0) {
        passes(false, "You haven't borrowed this book.");
      } else {
        passes();
      }
    }
  );
  let validation = new Validator({ book_id }, rules, error_msg);
  validation.checkAsync(passes, fails);

  function fails() {
    let message = [];
    for (var key in validation.errors.all()) {
      var value = validation.errors.all()[key];
      message.push(value[0]);
    }
    return res.status(200).json({
      code: 401,
      status: "error",
      message: message,
      result: [],
    });
  }

  async function passes() {
    try {
      await DB.query(`START TRANSACTION;`);
      sql_increment = `UPDATE book SET count = GREATEST(count + 1), updated_at = CURRENT_TIMESTAMP() WHERE id = '${book_id}'`;
      sql_delete = `DELETE FROM borrow WHERE user_id = '${user_id}' AND book_id = '${book_id}'`;
      await DB.query(sql_delete);
      res.json({
        code: 200,
        status: "success",
        message: ["Book returned."],
        result: [],
      });
    } catch (err) {
      err.message = err.message.includes("SQLState")
        ? "Query syntax error."
        : err.message;
      res.json({
        code: 400,
        status: "error",
        message: [err.message],
        result: [],
      });
    }
  }
};
