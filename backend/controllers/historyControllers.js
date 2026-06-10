import History from "../models/history.models.js";
import AppError from "../utils/AppError.js";

const getHistory = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "Admin") {
      return next(new AppError(403, "You are not authorized to view history logs"));
    }
    const { entity_type, entity_id } = req.query;
    let filter = {};
    if (entity_type) filter.entity_type = entity_type;
    if (entity_id) filter.entity_id = entity_id;

    const historyLogs = await History.find(filter).sort({ createdAt: -1 });

    res.status(200).json(historyLogs);
  } catch (error) {
    next(new AppError(500, error.message));
  }
};

export { getHistory };
