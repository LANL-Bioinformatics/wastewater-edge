const { body, param, validationResult } = require('express-validator')
const { bulkSubmissionStatus } = require('../utils/conf')

const validationRules = () => [
  param('code')
    .trim()
    .isLength({ min: 16, max: 16 })
    .withMessage('Invalid bulkSubmission code.'),
  body('name')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage(
      'Invalid bulkSubmission name, at least 3 but less than 30 characters.',
    ),
  body('desc').optional(),
  body('type')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage(
      'Invalid bulkSubmission type, at least 3 but less than 30 characters.',
    ),
  body('filename').trim().isLength({ min: 1 }).withMessage('Invalid filename.'),
  body('status')
    .optional()
    .trim()
    .isIn(bulkSubmissionStatus)
    .withMessage('Invalid status.'),
  body('public')
    .optional()
    .trim()
    .isBoolean()
    .withMessage('Invalid public. Must be true or false.'),
  body('sharedTo')
    .optional()
    .isArray()
    .withMessage('Invalid sharedTo. Must be an array of emails.'),
  body('sharedTo.*')
    .optional()
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email address'),
  body('projects')
    .optional()
    .isArray()
    .withMessage('Invalid projects. Must be an array of project codes.'),
  body('projects.*')
    .optional()
    .trim()
    .isLength({ min: 16, max: 16 })
    .withMessage('Invalid project code.'),
]

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }

  const resultErrors = {
    error: {},
    message: 'Validation failed',
    success: false,
  }
  errors.array().forEach(err => {
    resultErrors.error[err.param] = err.msg
  })
  return res.status(400).json(resultErrors)
}

module.exports = {
  validationRules,
  validate,
}
