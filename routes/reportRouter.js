const router = require("express").Router();
// const { createReport } = require("../controllers/reportController");

// // Middlewares
// const checkAuthentication = require("../middlewares/checkAuthentication");
// const checkReqBody = require("../middlewares/checkReqBody");

// // Set routes
// //* /api/v1/report/
// // Create a report
// router.post(
//   "/",
//   checkAuthentication(),
//   checkReqBody(["model_id", "item_id", "note"]),
//   async (req, res, next) => {
//     try {
//       let params = {
//         ...req.body,
//         reporterId: req.user.id,
//         status_id: 1
//       }
//       let report = await createReport(params);
//       // Return response
//       res.status(200).json({
//         success: true,
//         data: report
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
// );

// Export router
module.exports = router;
