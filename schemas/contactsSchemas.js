import Joi from 'joi';

export const createContactSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().min(1).required().email({
    minDomainSegments: 2,
  }),
  phone: Joi.string().min(1).required(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(1),
  email: Joi.string().min(1).email({
    minDomainSegments: 2,
  }),
  phone: Joi.string().min(1),
});
