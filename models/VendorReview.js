const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const vendorReview = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide review title"],
      maxlength: 100,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "please provide rating"],
    },
    comment: {
      type: String,
      required: [true, "please provide your comment"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
  },
  { timestamps: true }
);
vendorReview.index({ vendor: 1, user: 1 }, { unique: true });

vendorReview.statics.averageRating = async function (vendorId) {
  const ratingAverage = await this.aggregate([
    { $match: { vendor: vendorId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numberOfReviews: { $sum: 1 },
      },
    },
  ]);
  try {
    await this.model("Vendor").findOneAndUpdate(
      { _id: vendorId },
      {
        averageRating: Math.ceil(ratingAverage[0]?.averageRating || 0),
        numberOfReviews: ratingAverage[0]?.numberOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

vendorReview.post("save", async function () {
  await this.constructor.averageRating(this.vendor);
});

vendorReview.post("remove", async function () {
  await this.constructor.averageRating(this.vendor);
});

module.exports = model("VendorReview", vendorReview);
