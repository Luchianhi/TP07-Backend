import { body, validationResult } from 'express-validator';

// Étape 13 — Validation des Données
export const registerValidation = [
  body('username').isLength({ min: 3 }).withMessage('Username too short'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password too weak')
];

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
