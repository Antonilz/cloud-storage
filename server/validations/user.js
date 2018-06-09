const Joi = require('joi');
const roles = ['user', 'admin'];

module.exports = {
  // GET api/users
  listUsers: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number()
        .min(1)
        .max(100),
      name: Joi.string(),
      email: Joi.string(),
      role: Joi.string().valid(roles)
    }
  },

  // GET api/users/:userId
  getUser: {
    params: {
      userId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required()
    }
  },

  // POST api/users
  createUser: {
    body: {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .min(6)
        .max(20)
        .required(),
      name: Joi.string().max(20),
      role: Joi.string().valid(roles)
    }
  },

  // PUT api/users/:userId
  replaceUser: {
    body: {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .min(6)
        .max(20)
        .required(),
      name: Joi.string().max(20),
      role: Joi.string().valid(roles)
    },
    params: {
      userId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required()
    }
  },

  // PATCH api/users/:userId
  updateUser: {
    body: {
      email: Joi.string().email(),
      password: Joi.string()
        .min(6)
        .max(20),
      name: Joi.string().max(20),
      role: Joi.string().valid(roles)
    },
    params: {
      userId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required()
    }
  }
};
