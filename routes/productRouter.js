const router = require("express").Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authenticate");
const {
  uploadImage,
  // createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deletProduct,
  getTopRankProducts,
  getTopBrands,
  getNewArrival,
  recommendedProducts,
  topVendors
  createNewProduct
} = require("../controllers/productController");

router
  .route("/uploads")
  .post([authenticateUser, authorizePermissions("admin")], uploadImage);
router.route("/top-ranks").get(getTopRankProducts);
router.route("/top-brands").get(getTopBrands);
router.route("/new-arrivals").get(getNewArrival);
router.route("/recommended").get(recommendedProducts);
router.route("/top-vendors").get(topVendors);
router
  .route("/")
  .post([authenticateUser, authorizePermissions("admin")],createNewProduct)
  .get(getAllProducts);
router
  .route("/:id")
  .patch([authenticateUser, authorizePermissions("admin")], updateProduct)
  .get(getSingleProduct)
  .delete([authenticateUser, authorizePermissions("admin")], deletProduct);

module.exports = router;
