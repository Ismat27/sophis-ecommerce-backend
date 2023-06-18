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
  res.status(StatusCodes.CREATED).json({ product });
};

//create product
const createProduct = async (req, res) => {
  req.body.vendor = req.user.userId;
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
  const page = Number(req.query.page) || 1;
  const limit = 7;
  const skip = (page - 1) * limit;

  sortProducts = sortProducts.skip(skip).limit(limit);
  const sortedProducts = await sortProducts.select("-createdAt, -updatedAt");
  res.status(StatusCodes.OK).json({ product: sortedProducts });
};

//get single product
const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId })
    .populate([
      {
        path: "reviews",
        populate: { path: "user", select: "firstName lastName -_id" },
        //perDocumentLimit: 10,
        select: "-createdAt -updatedAt -_id",
      },
      {
        path: "vendor",
        select: "-password -confirmPassword -createdAt -updatedAt -_id",
      },
    ])
    .select("-createdAt -updatedAt");
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

//top ranked products
const getTopRankProducts = async (req, res) => {
  const products = await Product.aggregate([
    {
      $match: {
        averageRating: {
          $gte: 4,
        },
        numberOfReviews: {
          $gte: 4,
        },
      },
    },
  ]);
  if (!products) {
    throw new NotFoundError("no top ranked products");
  }
  res.status(StatusCodes.OK).json({ topRanks: products });
};

//top brand
const getTopBrands = async (req, res) => {
  const brands = await Product.aggregate([
    {
      $group: {
        _id: {
          brand: "$brand",
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $addFields: {
        brandName: "$_id.brand",
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
    {
      $project: {
        brandName: 1,
        _id: 0,
      },
    },
  ]);
  if (!brands) {
    throw new NotFoundError("no top brands");
  }
  res.status(StatusCodes.OK).json({ topBrands: brands });
};

const getNewArrival = async (req, res) => {
  const newArrival = await Product.aggregate([
    {
      $addFields: {
        year: {
          $year: "$createdAt",
        },
        month: {
          $month: "$createdAt",
        },
        week: {
          $week: "$createdAt",
        },
      },
    },
    {
      $sort: {
        week: -1,
        month: -1,
        year: -1,
      },
    },
  ]);
  const queryWeek = newArrival[0].week;
  const month = newArrival[0].month;
  const currentYear = newArrival[0].year;
  //const month = new Date().getMonth() + 1;
  /*const currentYear = new Date().getFullYear()*/
  const computedNewArrival = newArrival.filter((value) => {
    return (
      value.year === currentYear &&
      value.month === month &&
      value.week === queryWeek
    );
  });
  if (!computedNewArrival) {
    throw new NotFoundError("no new arrival");
  }
  res.status(StatusCodes.OK).json({ newArrival: computedNewArrival });
};

const recommendedProducts = async (req, res) => {
  const productsInDb = Product.countDocuments();
  const size = productsInDb > 30 ? 20 : 7;
  const products = await Product.aggregate([
    {
      $sample: {
        size: size,
      },
    },
    {
      $project: {
        updatedAt: 0,
        createdAt: 0,
      },
    },
  ]);
  if (!products) {
    throw new NotFoundError("no recommended products");
  }
  res.status(StatusCodes.OK).json({ recommended: products });
};

const topVendors = async (req, res) => {
  const topVendors = await Product.aggregate([
    {
      $group: {
        _id: "$vendor",
        productCount: {
          $sum: 1,
        },
      },
    },
    {
      $addFields: {
        vendor: "$_id",
      },
    },
    {
      $sort: {
        productCount: -1,
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  await Product.populate(topVendors, {
    path: "vendor",
    select: "-createdAt -updatedAt -password -confirmPassword -role",
  });
  if (!topVendors) {
    throw new NotFoundError("no top vendors");
  }
  res.status(StatusCodes.OK).json({ topVendors });
};

module.exports = {
  uploadImage,
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deletProduct,
  getTopRankProducts,
  getTopBrands,
  getNewArrival,
  recommendedProducts,
  topVendors,
  createNewProduct
};
