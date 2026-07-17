import * as service from "./dashboard.service.js";

export const getDashboard = async (req, res, next) => {
  try {
    const data = await service.buildDashboard(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};


