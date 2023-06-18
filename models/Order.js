
const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const singleOrderSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
});

const orderSchema = new Schema(
  {
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    orderItems: [singleOrderSchema],
    status: {
      type: String,
      enum: ["pending", "failed", "paid", "delivered", "canceled"],
      default: "pending",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trc_ref: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Order", orderSchema);
=======
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    billingAddress: {
      fullName: {type: String, required: true, trim: true},
      email: { type: String, required: true, trim: true },
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
    },
    shippingAddress: {
      fullName: {type: String, required: true, trim: true},
      email: { type: String, required: true, trim: true },
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
    },
    items: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }
    ],
    subtotal: { type: Number, required: [true, 'subtotal is required'] },
    shippingFee: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0  },
    total: { type: Number, required: [true, 'total amount due is required'] },
    paymentMethod: { type: String, required: true, default: 'card' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    fulfillmentStatus: { type: String, enum: ['unfulfilled', 'fulfilled'], default: 'unfulfilled' },
  },
  {timestamps: true}
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
