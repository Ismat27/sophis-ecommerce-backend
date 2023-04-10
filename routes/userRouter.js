const router = require("express").Router();
const { authenticateUser } = require("../middleware/authenticate");
const {
  register,
  loginUser,
  logout,
  getAllUsers,
  getUser,
  updateUser,
  userOrderItems
} = require("../controllers/userController");

router.route("/register").post(register);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/").get(getAllUsers);
router.route("/single-user").get(authenticateUser, getUser);
router.route("/:id").put(updateUser)
router.route("/:userId/order-items").get(authenticateUser, userOrderItems)

module.exports = router;
