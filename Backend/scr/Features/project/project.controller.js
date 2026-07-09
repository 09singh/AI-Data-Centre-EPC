import * as service from "./project.service.js";

export const createProject = async (req, res, next) => {
  try {
    const project = await service.createProject(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const projects = await service.getProjects(req.user.id);

    res.json({
      success: true,
      data: projects,
    });
  } catch (err) {
    next(err);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await service.getProject(req.params.id);

    res.json({
      success: true,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await service.updateProject(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await service.deleteProject(req.params.id);

    res.json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};