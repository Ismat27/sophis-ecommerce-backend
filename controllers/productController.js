const Product = require("../models/Product");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const { BadRequestError, NotFoundError } = require("../errors");
const { StatusCodes } = require("http-status-codes");
const Review = require("../models/Review");

//create product with image
const createNewProduct = async (req, res) => {
  req.body.user = req.user.userId;
  let imageUrl = ''
  const image = req.files.image;
  if (!image.mimetype.startsWith("image")) {
    throw new BadRequestError("please upload image");
  }
  const result = await cloudinary.uploader.upload(image.tempFilePath, {
    use_filename: true,
    unique_filename: false,
    folder: "file-upload",
  });
  fs.unlinkSync(image.tempFilePath);
  imageUrl = result.secure_url
  const {} = req.body;
  // const product = req.body;
  const product = await Product.create({...req.body, images:[imageUrl]});
  res.status(StatusCodes.CREATED).json({ ...product });
};

//create product
const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const {} = req.body;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const { search, category, sort } = req.query;
  let queryObject = {};
  if (search) {
    queryObject.name = { $regex: search, $options: "i" };
  }
  if (category) {
    queryObject.category = category;
  }
  let sortProducts = Product.find(queryObject);
  if (sort === "latest") {
    sortProducts = sortProducts.sort("-createdAt");
  }
  if (sort === "oldest") {
    sortProducts = sortProducts.sort("createdAt");
  }
  const page = Number(req.body.page) || 1;
  const limit = Number(req.body.limit) || 10;
  const skip = (page - 1) * limit;

  sortProducts = sortProducts.skip(skip).limit(limit);
  const sortedProducts = await sortProducts;
  res.status(StatusCodes.OK).json({ product: sortedProducts });
};

//get single product
const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate("reviews");
  if (!product) {
    throw new NotFoundError(`product with this id: ${productId} not found`);
  }
  res.status(StatusCodes.OK).json({ product });
};

const deletProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new NotFoundError(`product with this id: ${productId} not found`);
  }
  await product.remove();
  res.status(StatusCodes.OK).json({ product });
};

//update product
const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: productId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedProduct) {
    throw new BadRequestError(
      `failed to update product with the id: ${productId}`
    );
  }
  res.status(StatusCodes.OK).json({ product: updatedProduct });
};

//route for product image upload
const uploadImage = async (req, res) => {
  const image = req.files.image;
  if (!image.mimetype.startsWith("image")) {
    throw new BadRequestError("please upload image");
  }
  const result = await cloudinary.uploader.upload(image.tempFilePath, {
    use_filename: true,
    unique_filename: false,
    folder: "file-upload",
  });
  fs.unlinkSync(image.tempFilePath);
  res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
};

module.exports = {
  uploadImage,
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deletProduct,
  createNewProduct
};
