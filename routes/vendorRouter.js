const express = require('express')
const { authenticateUser, authorizePermissions } = require('../middleware/authenticate')
const {
    createVendorProfile,
    vendorOrderItems,
    verifyVendor,
    fetchVendors,
    registerVendor,
    createVendorReview
} = require('../controllers/vendorController')

const router = express.Router()

router.route('/').post(createVendorProfile).get(fetchVendors)
router.route('/:userId/order-items').get(authenticateUser, vendorOrderItems)
router.route('/verify').patch(verifyVendor)

router.route("/register").post(registerVendor);
router
  .route("/create-review")
  .post([authenticateUser, authorizePermissions("user")], createVendorReview);

module.exports = router;
