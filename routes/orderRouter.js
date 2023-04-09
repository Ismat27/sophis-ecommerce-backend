const express = require('express')
const {
    authenticateUser,
} = require("../middleware/authenticate")

const {
    newOrder,
    allOrders,
    singleOrder
} = require('../controllers/orderController')

const router = express.Router()

router.route("/")
.post([authenticateUser], newOrder)
.get(allOrders)

router.route('/:orderId')
.get(singleOrder)

module.exports = router