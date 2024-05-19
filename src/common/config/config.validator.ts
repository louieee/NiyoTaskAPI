import * as Joi from 'joi';

// define validation for all env variables
export const configValidation = Joi.object({
  NODE_ENV: Joi.string()
    .trim()
    .valid('development', 'production', 'test')
    .default('development')
    .required(),
  CONNECTION_STRING: Joi.string().trim().required(),
  PORT: Joi.number().default(3000),
});
