import Project from "./project.model.js";

export const createProject = async (data, userId) => {
  return await Project.create({
    ...data,
    createdBy: userId,
  });
};

export const getProjects = async (userId) => {
  return await Project.find({
    createdBy: userId,
  }).sort({ createdAt: -1 });
};

export const getProject = async (id) => {
  return await Project.findById(id);
};

export const updateProject = async (id, data) => {
  return await Project.findByIdAndUpdate(id, data, {
    new: true,
  });
};

export const deleteProject = async (id) => {
  return await Project.findByIdAndDelete(id);
};