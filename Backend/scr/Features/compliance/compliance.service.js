import Joi from "joi";

export const complianceSchema = Joi.object({
  projectId: Joi.string().required(),
  documentId: Joi.string().required(),
});