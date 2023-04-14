// Db
const request = require("request");
const { User, Role, Entry, Title } = require("../db/models");
// Utils
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Get all users
// GET /api/v1/users
exports.getAllUsers = catchAsync(async (req, res) => {
    let { page, limit } = req.query;
    // Find all users
    const users = await User.findAndCountAll({
        offset: (page - 1) * limit,
        limit: limit,
        order: [
            ["created_at", "DESC"]
        ],
        attributes: {
            exclude: ["password", "refresh_token", "access_token", "role_id"]
        },
        include: [
            { model: Role, attributes: ["name", "id"] }
        ]
    });
    // Return response
    res.status(200).json({
        status: "success",
        message: "Users fetched successfully",
        data: {
            page: page,
            limit: limit,
            total: users.count,
            items: users.rows,
        }
    });
});

// Get a user by id
// GET /api/v1/users/:id
exports.getUserById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // Find user
    const user = await User.findByPk(id, {
        attributes: {
            exclude: ["password", "refresh_token", "access_token", "role_id"]
        },
        include: [
            { model: Role, attributes: ["name", "id"] }
        ]
    });
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    // Return response
    res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: user,
    });
});

// Get a user's image by id
// GET /api/v1/users/:id/image
exports.getUserImageById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // Find user
    const user = await User.findByPk(id, { attributes: ["image_url"] });
    if (!user || !user.image_url) {
        return next(new AppError("User not found", 404));
    }
    request({
        url: user.image_url,
        encoding: null
    },
        (err, resp, buffer) => {
            if (!err && resp.statusCode === 200) {
                res.set("Content-Type", "image/jpeg");
                res.send(resp.body);
            } else {
                next(new AppError("Image not found", 404));
            }
        });
});

// Update a user by id
// PUT /api/v1/users/:id
exports.updateUserById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { username, image_url } = req.body;
    // Find user
    const user = await User.findByPk(id, {
        attributes: {
            exclude: ["password", "refresh_token", "access_token", "role_id"]
        },
        include: [
            { model: Role, attributes: ["name", "id"] }
        ]
    });
    if (!user) {
        next(new AppError("User not found", 404));
    }
    // Update user
    await user.update({ username, image_url });
    // Return response
    res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
    });
});

// Update a user's password by id
// PUT /api/v1/users/:id/password
exports.updateUserPasswordById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { password } = req.body;
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    // Update user password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    // Return response
    res.status(200).json({
        success: true,
        message: "User password updated successfully",
        data: null,
    });
});

// Delete a user by id
// DELETE /api/v1/users/:id
exports.deleteUserById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    // Delete user
    await user.destroy();
    // Return response
    res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: null,
    });
});

// Get entries by user id
// GET /api/v1/users/:id/entries
exports.getEntriesByUserId = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { page, limit } = req.query;
    // Find user
    const user = await User.findByPk(id, {
        attributes: {
            exclude: ["password", "refresh_token", "access_token", "role_id"]
        },
        include: [
            { model: Role, attributes: ["name", "id"] }
        ]
    });
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    // Find entries
    const entries = await Entry.findAndCountAll({
        offset: (page - 1) * limit,
        limit: limit,
        order: [
            ["created_at", "DESC"]
        ],
        attributes: { exclude: ["title_id"] },
        where: { user_id: id },
        include: [
            {
                model: Title,
                attributes: ["name", "id"],
            }
        ],
    });
    // Return response
    res.status(200).json({
        success: true,
        message: "Entries fetched successfully",
        data: {
            page: page,
            limit: limit,
            total: entries.count,
            items: entries.rows,
        },
    });
});
