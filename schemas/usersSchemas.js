import Joi from 'joi';
import { statusList } from '../helpers/user-constants.js';

export const userSignUpSchema = Joi.object({
  password: Joi.string().min(1).required(),
  email: Joi.string().min(1).required().email({
    minDomainSegments: 2,
  }),
  subscription: Joi.string().valid(...statusList),
  token: Joi.string(),
});

export const userSignInSchema = Joi.object({
  password: Joi.string().min(1).required(),
  email: Joi.string().min(1).required().email({
    minDomainSegments: 2,
  }),
});
