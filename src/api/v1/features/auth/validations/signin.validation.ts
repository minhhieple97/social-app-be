import Joi, { ObjectSchema } from 'joi';

const signinSchema: ObjectSchema = Joi.object()
  .keys({
    username: Joi.string().min(4).max(8).messages({
      'string.base': 'Username must be of type string',
      'string.min': 'Invalid username',
      'string.max': 'Invalid username',
      'string.empty': 'Username is a required field'
    }),
    email: Joi.string().email().messages({
      'string.base': 'Email must be of type string',
      'string.email': 'Email must be valid',
      'string.empty': 'Email is a required field'
    }),
    password: Joi.string().required().min(4).max(8).messages({
      'string.base': 'Password must be of type string',
      'string.min': 'Invalid password',
      'string.max': 'Invalid password',
      'string.empty': 'Password is a required field'
    })
  })
  .xor('username', 'email');

export { signinSchema };
