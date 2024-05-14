// Db
const { Report, User } = require("../db/models");
const AppError = require("../utils/appError");

const getReports = async () => {
    return await Report.findAll({ order: [["id", "ASC"]] });
};

const getReportByParams = async (params) => {
    return await Report.findOne({ where: { ...params } });
};

const createReport = async (params) => {
    return await Report.create(params);
};

const updateReportByParams = async (params, data) => {
    const report = await Report.findOne({ where: { ...params } });
    Object.keys(data).forEach((key) => {
        report[key] = data[key];
    });
    await report.save();
    return report.toJSON();
};

const deleteReportByParams = async (params) => {
    // Find report
    const report = await Report.findOne({ where: { ...params } });
    if (!report) throw new AppError("Report not found", 404);
    // Check if there are users with this report
    const userCount = await User.count({ where: { reportId: params.id } });
    if (userCount && userCount > 0)
        throw new AppError("There are users with this report.");
    // Delete report
    await report.destroy();
};

module.exports = {
    getReports,
    createReport,
    getReportByParams,
    updateReportByParams,
    deleteReportByParams,
};
