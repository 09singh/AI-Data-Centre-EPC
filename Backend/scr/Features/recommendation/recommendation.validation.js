import Joi from "joi";

export const recommendationSchema = Joi.object({
  projectId: Joi.string().required(),

  documentId: Joi.string().required(),
});