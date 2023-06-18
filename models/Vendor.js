const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { model, Schema } = mongoose;
const VendorReview = require("./VendorReview");

const vendorSchema = Schema(
  {
    firstName: {
      type: String,
      required: [true, "please provide first name"],
      minLength: 3,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "please provide last name"],
      minLength: 3,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "please provide email"],
      validate: {
        validator: validator.isEmail,
        message: "provide valid email",
      },
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, "please provide business name"],
      minLength: 4,
      trim: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
    phoneNumber: {
      type: String,
      required: [true, "please provide phone number"],
      validate: {
        validator: validator.isMobilePhone,
        message: "please provide a valid mobile number",
      },
    },
    password: {
      type: String,
      minLength: 8,
      required: [true, "please provide password"],
    },
    confirmPassword: {
      type: String,
      minLength: 8,
      required: [true, "please provide password"],
    },
    role: {
      type: String,
      required: [true, "please provide a role"],
      enum: ["vendor"],
      default: "vendor",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

vendorSchema.virtual("review", {
  ref: "VendorReview",
  localField: "_id",
  foreignField: "vendor",
  justOne: false,
});
vendorSchema.post("remove", async function () {
  await VendorReview.deleteMany({ vendor: this._id });
});

vendorSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  if (this.password === this.confirmPassword) {
    this.password = await bcrypt.hash(this.password, salt);
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, salt);
  }
});

vendorSchema.methods.comparePasswords = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

module.exports = model("Vendor", vendorSchema);

//first name, last name, email, phone number, password, confirm password
