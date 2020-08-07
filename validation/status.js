const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateStatusInput(data) {
  let errors = {};
  data.text = !isEmpty(data.text) ? data.text : "";

  if (validator.isEmpty(data.text)) {
    errors.text = "Text is required";
  }

  if (!validator.isLength(data.text, { min: 1, max: 240 })) {
    errors.text = "Status must be less than 240 characters";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
