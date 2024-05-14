const router = require("express").Router();

// Import controllers
const authRoutes = require("./authRouter");
const homeRoutes = require("./homeRouter");
const userRoutes = require("./userRouter");
const roleRoutes = require("./roleRouter");
const titleRoutes = require("./titleRouter");
const entryRoutes = require("./entryRouter");

// Set routes
router.use("/auth", authRoutes);
router.use("/home", homeRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/titles", titleRoutes);
router.use("/entries", entryRoutes);

// Export router
module.exports = router;
