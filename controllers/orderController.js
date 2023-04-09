const {BadRequestError} = require("../errors")
const {StatusCodes} = require('http-status-codes')
const Order = require('../models/Order')
const OrderItem = require('../models/OrderItem')
const Product = require("../models/Product")

const newOrder = async (req, res) => {
    req.body.user = req.user.userId;
    const customer = req.user.userId;
    const {
        shippingAddress,
        billingAddress,
        items
    } = req.body
    if (!items) {
        throw new BadRequestError('ordered products cannot be empty')
    }
    // loop through the items
    // verify they are products in the database
    // calculate the total cost of items using data in the database
    // consider the discount in the above calculation
    let total_amount = 0;
    let total_items = 0;
    for (const item of items) {
        const product = await Product.findById(item.id)
        total_amount += Number(product.price) * Number(item.quantity)
        total_items += Number(item.quantity)
    }
    const orderNumber = String(new Date().getTime())
    const order = await Order.create({
        shippingAddress,
        billingAddress,
        customer,
        subtotal: total_amount,
        total: total_amount,
        orderNumber
    })
    let orderItems = []
    for (const item of items) {
        const orderItem = await OrderItem.create({
            customer: customer,
            product: item.id,
            quantity: item.quantity,
            order: order._id
        })
        orderItems.push(orderItem)
    }
    order.items = [...orderItems]
    await order.save()
    res.status(StatusCodes.CREATED).json({orderNumber, total_amount, total_items})
}

const allOrders = async (req, res) => {
    const orders =  await Order.find().populate({
        path: 'items',
        populate: 'product'
    })
    res.status(StatusCodes.CREATED).json({orders})
}

const singleOrder = async (req, res) => {
    const { orderId } = req.params
    const order = await Order.findById(orderId).populate({
        path: 'items',
        populate: 'product'
    })
    res.status(StatusCodes.OK).json({order})
}

module.exports = {
    newOrder,
    allOrders,
    singleOrder
}