const Joi = require("joi");

const collabSchema = Joi.object({
  collab: Joi.object({
    title: Joi.string().required(),
    skills: Joi.string().required(),
    description: Joi.string().required(),
  }).required(),
  deleteImages: Joi.array(),
});

module.exports = collabSchema;
