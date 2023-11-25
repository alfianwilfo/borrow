const Validator = require("validatorjs");
const DB = require("../../config/db");
exports.register = async (req, res, next) => {
  let sql_register;
  let { email, password } = req.body;
  let rules = {
    email: "required|email_available|regex:/^[^s@]+@[^s@]+.[^s@]+$/",
    password: "required|regex:/^(?=.*[A-Z])[A-Za-zd]{8,}$/",
  };

  let error_msg = {
    in: "invalid :attribute",
    regex: "invalid :attribute",
  };
  Validator.registerAsync(
    "email_available",
    (email, attribute, req, passes) => {
      let sql_count = `SELECT COUNT(*) from user where email = '${email}'`;
      DB.query(sql_count, function (err, result) {
        if (err) throw err;
        if (result[0]["COUNT(*)"] == 0) {
          passes();
        } else {
          passes(false, "email has already been taken.");
        }
      });
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
      sql_register = `INSERT INTO user (email, password) VALUES ('${email}', '${password}')`;
      DB.query(sql_register, function (err, result) {
        if (err) {
          err.message = err.message.includes("Duplicate entry")
            ? "Email has already been taken."
            : err.message;
          res.json({
            code: 400,
            status: "error",
            message: [err.message],
            result: [],
          });
        } else {
          res.json({
            code: 201,
            status: "success",
            message: ["Register success."],
            result: [],
          });
        }
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

exports.login = async (req, res, next) => {
  let rules = {
    email: "required",
    password: "required",
  };

  let error_msg = {
    in: "invalid :attribute",
    regex: "invalid :attribute",
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
      console.log("login");
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
