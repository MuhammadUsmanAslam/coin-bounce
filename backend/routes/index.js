const router = require("express").Router();
const authController = require("../controller/authController");
const blogController = require("../controller/blogController");
const commentController = require("../controller/commentController");
const auth = require("../middlewares/auth");

// User
// 1 Login
router.post("/login", authController.login);

// 2 Register
router.post("/register", authController.register);

// 3 Logout
router.post("/logout", auth, authController.logout);

// Refresh
router.get("/refresh", authController.refresh);


// Blog CRUD operations
// Create a new blog
router.post('/blog', auth, blogController.create);

// Read All blogs
router.get('/blog/all', auth, blogController.getAll);

// Read one blog by ID
router.get('/blog/:id', auth, blogController.getById);

// Update one blog by ID
router.put('/blog/', auth, blogController.update);

// Delete one blog by ID
router.delete('/blog/:id', auth, blogController.delete);

// Comment
// Create Comment
router.post('/comment', auth, commentController.create);

// Get Comment by Blog Id
router.get('/comment/:id', auth, commentController.getById);

module.exports = router;