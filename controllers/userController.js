const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors/index");
const OrderItem = require('../models/OrderItem')
const formatProduct = require('../utils/formatProduct')
const {
  createToken,
  userToken,
  addTokonToCookie,
  grantUserPermission,
} = require("../utils/index");



//register user
const register = async (req, res) => {
  const { email } = req.body;
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new BadRequestError("Email already exists");
  }
  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";
  req.body.role = role;

  const user = await User.create(req.body);
  const tokenUser = userToken(user);
  const token = createToken({ payload: tokenUser });
  addTokonToCookie({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ token });
};

//login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("invalid login details");
  }
  const verifyPassword = await user.comparePasswords(password);
  if (!verifyPassword) {
    throw new BadRequestError("invalid password");
  }
  const tokenUser = userToken(user);
  const token = createToken({ payload: tokenUser });
  addTokonToCookie({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ token });
};

const logout = (req, res) => {
  res.cookie("token", "log out user", {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.status(StatusCodes.OK).json({ message: "user logged out" });
  //res.clearCookie("token");
};

// get all users
const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  if (!users) {
    throw new BadRequestError(`no user found`);
  }
  res.status(StatusCodes.OK).json({ users });
};

const getUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).select(
    "-password -comfirmPassword"
  );
  if (!user) {
    throw new NotFoundError(`no usser with the id: ${req.user.userId}`);
  }
  grantUserPermission(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

//update user
const updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
};

const userOrderItems = async (req, res) => {
  const { userId } = req.params
  const orderItems = await OrderItem.find({
    customer: {_id: userId}
  }).sort('-updatedAt')
  .populate('product')
  const items = orderItems.map(item => {
    return {
      orderItemId: item._id,
      product: formatProduct(item.product),
      customerId: item.customer
    }
  })
  res.status(StatusCodes.OK).json(items)
}

module.exports = { 
  register, 
  loginUser, 
  logout, 
  getAllUsers, 
  getUser, 
  updateUser,
  userOrderItems
};
