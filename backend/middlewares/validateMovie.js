const { body, validationResult } = require("express-validator");

const createMovieValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive number"),
  body("genre").notEmpty().withMessage("Genre is required"),
  body("rating")
    .isFloat({ min: 0, max: 10 })
    .withMessage("Rating must be 0-10"),

  body("posterUrl")
    .optional()
    .isURL()
    .withMessage("Poster URL must be a valid URL"),

  body("bannerUrl")
    .optional()
    .isURL()
    .withMessage("Banner URL must be a valid URL"),

  body("trailerUrl")
    .optional()
    .isURL()
    .withMessage("Trailer URL must be a valid URL"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["now", "soon"]),
];

const updateMovieValidation = [
  body("title").optional().notEmpty().withMessage("Title is required"),
  body("description").optional().notEmpty().withMessage("Description is required"),
  body("duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive number"),
  body("genre").optional().notEmpty().withMessage("Genre is required"),
  body("rating")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("Rating must be 0-10"),

  body("posterUrl")
    .optional()
    .isURL()
    .withMessage("Poster URL must be a valid URL"),

  body("bannerUrl")
    .optional()
    .isURL()
    .withMessage("Banner URL must be a valid URL"),

  body("trailerUrl")
    .optional()
    .isURL()
    .withMessage("Trailer URL must be a valid URL"),

  body("status")
    .optional()
    .isIn(["now", "soon"])
    .withMessage("Status must be 'now' or 'soon'"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  createMovieValidation,
  updateMovieValidation,
  validate,
};