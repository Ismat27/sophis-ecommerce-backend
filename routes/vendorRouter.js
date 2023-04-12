const express = require('express')
const { authenticateUser } = require('../middleware/authenticate')
const {
    createVendorProfile,
    vendorOrderItems
} = require('../controllers/vendorController')

const router = express.Router()

router.route('/').post(createVendorProfile)
router.route('/:userId/order-items').get(authenticateUser, vendorOrderItems)

module.exports = router