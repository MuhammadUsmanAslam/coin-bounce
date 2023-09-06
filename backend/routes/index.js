const router = require("express").Router();
const authController = require("../controller/authController");
const auth = require("../middlewares/auth");

router.get("/", (req, res) => {
    res.json({msg: "/home"});
});

// User
// 1 Login
router.post("/login", authController.login);

// 2 Register
router.post("/register", authController.register);

// 3 Logout
router.post("/logout", auth, authController.logout);

// Refresh
router.get("/refresh", authController.refresh);


// Blog
// CRUD operations
// Create
// Read All
// Read by ID
// Update
// Delete

// Comment
// Create
// Read

module.exports = router;