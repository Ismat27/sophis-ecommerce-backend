const router = require("express").Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authenticate");
const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

router
  .route("/")
  .post([authenticateUser, authorizePermissions("user")], createReview)
  .get(getAllReviews);
router
  .route("/:id")
  .patch([authenticateUser, authorizePermissions("admin")], updateReview)
  .delete([authenticateUser, authorizePermissions("admin")], deleteReview)
  .get(getSingleReview);

module.exports = router;
