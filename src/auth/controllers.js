const Validator = require("validatorjs");
const DB = require("../../config/db");
const Helper = require("./helpers");
exports.register = async (req, res, next) => {
  let sql_register,
    id = Helper.getId();
  let { email, password } = req.body;
  let rules = {
    email: "required|regex:/^[^s@]+@[^s@]+.[^s@]+$/",
    password: "required|regex:/^(?=.*[A-Z])[A-Za-zd]{8,}$/",
  };

  let error_msg = {
    in: "invalid :attribute",
    regex: "invalid :attribute",
  };
  Validator.registerAsync(
    "email_available",
    async (email, attribute, req, passes) => {
      let sql_count = `SELECT COUNT(*) from user where email = '${email}'`;
      const [rows, fields] = await DB.query(sql_count);
      if (rows[0] == 0) {
        passes();
      } else {
        passes(false, "email has already been taken.");
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
      password = await Helper.hashPassword(password);
      sql_register = `INSERT INTO user (id, email, password, created_at, updated_at) VALUES ('${id}', '${email}', '${password}' , CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())`;
      await DB.query(sql_register);
      res.json({
        code: 200,
        status: "success",
        message: ["Register success."],
        result: [],
      });
    } catch (err) {
      err.message = err.message.includes("SQLState")
        ? "Query syntax error."
        : err.message.includes("Duplicate entry")
        ? "Email has already been taken."
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

exports.login = async (req, res, next) => {
  let token, sql_find;
  let { email, password } = req.body;
  let rules = {
    email: "required",
    password: "required",
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
      sql_find = `SELECT * FROM user WHERE email = '${email}'`;
      const [rows, fields] = await DB.query(sql_find);
      if (rows.length) {
      } else {
        res.json({
          code: 404,
          status: "error",
          message: ["Wrong email or password."],
          result: [],
        });
      }
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
