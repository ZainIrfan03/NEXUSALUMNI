const { body } = require("express-validator");

// @route PUT /api/student/profile | PUT /api/alumni/profile
// All fields are optional here — a profile edit form can submit a
// partial update — but whatever IS sent must be the right shape.
const updateProfileValidators = [
  body("fullName").optional({ values: "falsy" }).trim().isLength({ max: 100 }),
  body("location").optional({ values: "falsy" }).trim().isLength({ max: 100 }),
  body("headline").optional({ values: "falsy" }).trim().isLength({ max: 150 }),
  body("bio").optional({ values: "falsy" }).trim().isLength({ max: 1000 }),
  body("skills").optional().isArray().withMessage("skills must be a list"),
  body("skills.*").optional().isString().trim(),
  body("interests").optional().isArray().withMessage("interests must be a list"),
  body("interests.*").optional().isString().trim(),
  body("isPublic").optional().isBoolean().withMessage("isPublic must be true or false"),
  body("resumeUrl").optional({ values: "falsy" }).trim(),
  body("openToNetworking").optional().isBoolean().withMessage("openToNetworking must be true or false"),
  // Alumni-only fields — harmless no-ops on the student route
  body("company").optional({ values: "falsy" }).trim().isLength({ max: 150 }),
  body("jobTitle").optional({ values: "falsy" }).trim().isLength({ max: 150 }),
  body("openToMentorship").optional().isBoolean().withMessage("openToMentorship must be true or false"),
];

// @route POST /api/student/profile/experience | POST /api/alumni/profile/experience
const addExperienceValidators = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("company").trim().notEmpty().withMessage("Company is required"),
  body("startDate").optional({ values: "falsy" }).trim(),
  body("endDate").optional({ values: "falsy" }).trim(),
  body("current").optional().isBoolean().withMessage("current must be true or false"),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 1000 }),
];

// @route POST /api/student/profile/education | POST /api/alumni/profile/education
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
