const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "please provide product name"],
      maxlength: [200, "name can not be more than 80 characters"],
    },
    price: {
      type: Number,
      required: [true, "please provide product price"],
      default: 0,
    },
    category: {
      type: String,
      required: [true, "please provide product category"],
    },
    description: {
      type: String,
      required: [true, "please provide product description"],
      maxlength: [
        2000,
        "product description can not be more than 700 characters",
      ],
    },
    specification: {
      type: String,
      maxlength: [
        2000,
        "product specification can not be more than 700 characters",
      ],
      default: "product specification",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    discount: {
      required: [true, "please provide discount"],
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      required: [true, "provide tax value"],
      default: 0,
    },
    images: {
      type: [String],
      default: ["/uploads/couch.jpeg"],
    },
    brand: {
      type: String,
      required: [true, "please provide brand"],
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "please provide vendor"],
    },
    colors: {
      type: [String],
      default: ["#3ddd"],
      required: [true, "please provide product colors"],
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: [true, "provide product inventory"],
      default: 10,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
    size: {
      type: [String],
      default: ["size"],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

productSchema.post("remove", async function () {
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = model("Product", productSchema);
