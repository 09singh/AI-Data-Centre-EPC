import * as service from "./report.service.js";

export const generateReport = async (req, res, next) => {
  try {
    const report = await service.generateReport(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const reports = await service.getReports();

    res.json({
      success: true,
      data: reports,
    });
  } catch (err) {
    next(err);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const report = await service.getReport(req.params.id);

    res.json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    await service.deleteReport(req.params.id);

    res.json({
      success: true,
      message: "Report deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};