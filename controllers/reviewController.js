const Review = require("../models/Review");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError, BadRequestError } = require("../errors/index");
const { grantUserPermission } = require("../utils/index");

//create review
const createReview = async (req, res) => {
  const { product: productId } = req.body;
  const isProductValid = await Product.findOne({ _id: productId });

  if (!isProductValid) {
    throw new NotFoundError(`product with the id: ${productId} not found`);
  }
  const reviewExist = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (reviewExist) {
    throw new BadRequestError("Review already submitted");
  }
  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

//all reviews
const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name company price",
  });
  if (!reviews) {
    throw new NotFoundError("no review found");
  }
  res.status(StatusCodes.OK).json({ reviews });
};

//single review
const getSingleReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id });
  if (!review) {
    throw new NotFoundError(`review with the id: ${req.params.id} not found`);
  }
  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { title, rating, comment } = req.body;
  const review = await Review.findOne({ _id: reviewId });
  grantUserPermission(req.user, review.user);
  const updatedReview = await Review.findOneAndUpdate(
    { _id: reviewId },
    { title, rating, comment },
    { new: true, runValidators: true }
  );
  if (!updatedReview) {
    throw new BadRequestError(
      `failed to update product with the id: ${productId}`
    );
  }
  res.status(StatusCodes.OK).json({ review: updatedReview });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  grantUserPermission(req.user, review.user);
  const deletedReview = await Review.findOneAndDelete({ _id: reviewId });
  if (!deletedReview) {
    throw new BadRequestError(
      `failed to delete product with the id: ${productId}`
    );
  }
  res.status(StatusCodes.OK).json({ review: deletedReview });
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  getSingleReview,
};
