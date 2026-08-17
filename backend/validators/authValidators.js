const { body } = require("express-validator");
const {
  ROLES,
  PASSWORD_MIN_LENGTH,
  FULL_NAME_MAX_LENGTH,
} = require("../utils/constants");

// Only student/alumni may self-register (mirrors the check already done
// inside registerUser, but rejecting here means it never even reaches
// the controller with a bad role).
const allowedPublicRoles = [ROLES.STUDENT, ROLES.ALUMNI];

const registerValidators = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ max: FULL_NAME_MAX_LENGTH })
    .withMessage(`Full name must not exceed ${FULL_NAME_MAX_LENGTH} characters`),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(allowedPublicRoles)
    .withMessage("This role cannot be self-registered"),

  // Student-only fields — required only when role === "student"
  body("department")
    .if(body("role").equals(ROLES.STUDENT))
    .trim()
    .notEmpty()
    .withMessage("Department is required"),
  body("session")
    .if(body("role").equals(ROLES.STUDENT))
    .trim()
    .notEmpty()
    .withMessage("Session is required"),
  body("rollNumber")
    .if(body("role").equals(ROLES.STUDENT))
    .trim()
    .notEmpty()
    .withMessage("Roll number is required"),

  // Alumni-only fields — required only when role === "alumni"
  body("graduationYear")
    .if(body("role").equals(ROLES.ALUMNI))
    .notEmpty()
    .withMessage("Graduation year is required"),
  body("company").optional({ values: "falsy" }).trim(),
  body("jobTitle").optional({ values: "falsy" }).trim(),
];

const loginValidators = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
  body("keepSignedIn")
    .optional()
    .isBoolean()
    .withMessage("keepSignedIn must be true or false"),
];

module.exports = { registerValidators, loginValidators };
