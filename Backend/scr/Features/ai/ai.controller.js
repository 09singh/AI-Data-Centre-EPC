import * as service from "./ai.service.js";

export const health = async (req, res, next) => {
  try {
    const data = await service.health();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const chat = async (req, res, next) => {
  try {
    const data = await service.chat(req.body);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const search = async (req, res, next) => {
  try {
    const data = await service.search(req.body);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const compliance = async (req, res, next) => {
  try {
    const data = await service.compliance(req.body);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const recommendation = async (req, res, next) => {
  try {
    const data = await service.recommendation(req.body);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const report = async (req, res, next) => {
  try {
    const data = await service.report(req.body);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};