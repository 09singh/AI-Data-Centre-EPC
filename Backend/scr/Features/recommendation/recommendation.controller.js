import * as service from "./recommendation.service.js";

export const generateRecommendations = async (req, res, next) => {
  try {
    const recommendations = await service.generateRecommendations(req.body);

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const data = await service.getRecommendations();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendation = async (req, res, next) => {
  try {
    const data = await service.getRecommendation(req.params.id);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const data = await service.updateStatus(
      req.params.id,
      req.body.status
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};