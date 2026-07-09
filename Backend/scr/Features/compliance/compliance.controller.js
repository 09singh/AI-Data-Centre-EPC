import * as service from "./compliance.service.js";

export const generateCompliance = async (req, res, next) => {
  try {
    const report = await service.generateCompliance(req.body);

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

export const getComplianceReports = async (req, res, next) => {
  try {
    const reports = await service.getComplianceReports();

    res.json({
      success: true,
      data: reports,
    });
  } catch (err) {
    next(err);
  }
};

export const getComplianceReport = async (req, res, next) => {
  try {
    const report = await service.getComplianceReport(req.params.id);

    res.json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};