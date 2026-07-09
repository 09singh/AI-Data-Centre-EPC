import Joi from "joi";

export const createProjectSchema = Joi.object({
  name: Joi.string().required(),

  description: Joi.string().allow(""),

  company: Joi.string().required(),

  location: Joi.string().required(),

  status: Joi.string().valid(
    "Planning",
    "In Progress",
    "Completed",
    "On Hold"
  ),
});