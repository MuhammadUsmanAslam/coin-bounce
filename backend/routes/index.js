const router = require("express").Router();
const authController = require("../controller/authController");
const blogController = require("../controller/blogController");
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
// Create
// Read

module.exports = router;