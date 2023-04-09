const express = require('express')
const {
    createVendorProfile,
    vendorOrderItems
} = require('../controllers/vendorController')

const router = express.Router()

router.route('/').post(createVendorProfile)
router.route('/:userId/order_items').get(vendorOrderItems)

module.exports = router