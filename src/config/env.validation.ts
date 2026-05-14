import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV:       Joi.string().valid('development', 'production', 'test').default('development'),
  PORT:           Joi.number().default(3000),
  DATABASE_URL:   Joi.string().required(),
  JWT_SECRET:     Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  FRONTEND_URL:   Joi.string().uri().required(),
  MAIL_HOST:      Joi.string().required(),
  MAIL_PORT:      Joi.number().required(),
  MAIL_USER:      Joi.string().required(),
  MAIL_PASS:      Joi.string().required(),
});