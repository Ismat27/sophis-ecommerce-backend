const mongoose = require('mongoose')
const { Schema, model} = mongoose

const OrderItemSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product ordered cannot be empty']
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'customer cannot be empty']
        },
        quantity: {
            type: Number,
            required: [true, 'quantity ordered should be specify']
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: 'Order'
        }
    },
    { timestamps: true }
)

const OrderItem = model('OrderItem', OrderItemSchema)

module.exports = OrderItem