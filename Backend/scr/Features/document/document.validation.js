import Joi from "joi";

export const uploadDocumentSchema = Joi.object({
  projectId: Joi.string().required(),
});