const { body } = require("express-validator");
const { PROFILE_FIELD_LIMITS } = require("../constants");
const updateProfileValidators = [
  body("fullName").optional({ values: "falsy" }).trim().isLength({ max: PROFILE_FIELD_LIMITS.FULL_NAME }),
  body("location").optional({ values: "falsy" }).trim().isLength({ max: PROFILE_FIELD_LIMITS.LOCATION }),
  body("headline").optional({ values: "falsy" }).trim().isLength({ max: PROFILE_FIELD_LIMITS.HEADLINE }),
  body("bio").optional({ values: "falsy" }).trim().isLength({ max: PROFILE_FIELD_LIMITS.BIO }),
  body("skills").optional().isArray().withMessage("skills must be a list"),
  body("skills.*").optional().isString().trim(),
  body("interests").optional().isArray().withMessage("interests must be a list"),
  body("interests.*").optional().isString().trim(),
  body("isPublic").optional().isBoolean().withMessage("isPublic must be true or false"),
  body("resumeUrl").optional({ values: "falsy" }).trim(),
  body("openToNetworking").optional().isBoolean().withMessage("openToNetworking must be true or false"),
  body("company").optional({ values: "falsy" }).trim().isLength({ max: PROFILE_FIELD_LIMITS.COMPANY }),
  body("jobTitle").optional({ values: "falsy" }).trim().isLength({ max: PROFILE_FIELD_LIMITS.JOB_TITLE }),
  body("openToMentorship").optional().isBoolean().withMessage("openToMentorship must be true or false"),
];
const addExperienceValidators = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("company").trim().notEmpty().withMessage("Company is required"),
  body("startDate").optional({ values: "falsy" }).trim(),
  body("endDate").optional({ values: "falsy" }).trim(),
  body("current").optional().isBoolean().withMessage("current must be true or false"),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: PROFILE_FIELD_LIMITS.EXPERIENCE_DESCRIPTION }),
];
const addEducationValidators = [
  body("school").trim().notEmpty().withMessage("School is required"),
  body("degree").trim().notEmpty().withMessage("Degree is required"),
  body("year").optional({ values: "falsy" }).trim(),
];

module.exports = {
  updateProfileValidators,
  addExperienceValidators,
  addEducationValidators,
};
