const validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};
  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";
  data.dob = !isEmpty(data.dob) ? data.dob : "";
  data.screen_name = !isEmpty(data.screen_name) ? data.screen_name : "";

  if (!validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be between 2 and 30 characters";
  }
  if (!validator.isLength(data.screen_name, { min: 3, max: 40 })) {
    errors.screen_name = "Username must be between 3 and 40 characters";
  }

  if (validator.isEmpty(data.screen_name)) {
    errors.screen_name = "Username is required";
  }

  if (validator.isEmpty(data.name)) {
    errors.name = "Name is required";
  }

  if (validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  }
  if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }
  if (validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }
  if (isEmpty(data.dob)) {
    errors.dob = "Date of birth is required";
  }
  if (!validator.isDate(data.dob, "MM/DD/YYYY")) {
    errors.dob = "Invlid date";
  }
  if (!validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be atleast 6 characters";
  }
  if (validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm password is required";
  }

  if (!validator.equals(data.password2, data.password)) {
    errors.password2 = "Passwords must match";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
