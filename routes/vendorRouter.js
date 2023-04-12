const express = require('express')
const { authenticateUser } = require('../middleware/authenticate')
const {
    createVendorProfile,
    vendorOrderItems,
    verifyVendor,
    fetchVendors
} = require('../controllers/vendorController')

const router = express.Router()

router.route('/').post(createVendorProfile).get(fetchVendors)
router.route('/:userId/order-items').get(authenticateUser, vendorOrderItems)
router.route('/verify').patch(verifyVendor)

module.exports = router