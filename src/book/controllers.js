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
